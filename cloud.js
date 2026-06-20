(() => {
  const config = window.APP_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey && window.supabase);
  const client = configured ? window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey) : null;
  const bucket = config.storageBucket || "wedding-documents";
  const workspaceId = config.workspaceId || "casamento-compartilhado";

  async function session() {
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  }

  window.CloudStore = {
    configured,
    client,
    async session() { return session(); },
    async ensureSession() {
      if (!client) throw new Error("Configure o Supabase em config.js.");
      const current = await session();
      if (current) return current;
      const { data, error } = await client.auth.signInAnonymously();
      if (error) throw error;
      return data.session;
    },
    async signIn(email, password) {
      if (!client) throw new Error("Configure o Supabase em config.js.");
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.session;
    },
    async signUp(email, password) {
      if (!client) throw new Error("Configure o Supabase em config.js.");
      const emailRedirectTo = config.appUrl || new URL("./", window.location.href).href;
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo }
      });
      if (error) throw error;
      return data;
    },
    async signOut() {
      if (client) await client.auth.signOut();
    },
    async load() {
      const current = await this.ensureSession();
      if (!current) return null;
      const { data, error } = await client.from("wedding_shared_dashboards").select("data").eq("workspace_id", workspaceId).maybeSingle();
      if (error) throw error;
      return data?.data || null;
    },
    async save(data) {
      const current = await this.ensureSession();
      if (!current) return;
      const { error } = await client.from("wedding_shared_dashboards").upsert({
        workspace_id: workspaceId,
        data,
        updated_at: new Date().toISOString()
      }, { onConflict: "workspace_id" });
      if (error) throw error;
    },
    async upload(file) {
      const current = await this.ensureSession();
      if (!current) throw new Error("Entre na sua conta para enviar documentos.");
      const clean = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_");
      const path = `${workspaceId}/${crypto.randomUUID()}-${clean}`;
      const { error } = await client.storage.from(bucket).upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (error) throw error;
      return { path, name: file.name };
    },
    async signedUrl(path) {
      const { data, error } = await client.storage.from(bucket).createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
    async deleteDocument(path) {
      if (!path) return;
      await this.ensureSession();
      const { error } = await client.storage.from(bucket).remove([path]);
      if (error) throw error;
    },
    onAuthChange(callback) {
      if (!client) return;
      client.auth.onAuthStateChange((_event, currentSession) => callback(currentSession));
    },
    subscribe(callback) {
      if (!client) return null;
      return client.channel(`workspace:${workspaceId}`)
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "wedding_shared_dashboards",
          filter: `workspace_id=eq.${workspaceId}`
        }, payload => callback(payload.new.data))
        .subscribe();
    }
  };
})();
