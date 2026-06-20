(() => {
  const config = window.APP_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey && window.supabase);
  const client = configured ? window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey) : null;
  const bucket = config.storageBucket || "wedding-documents";

  async function session() {
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  }

  window.CloudStore = {
    configured,
    client,
    async session() { return session(); },
    async signIn(email, password) {
      if (!client) throw new Error("Configure o Supabase em config.js.");
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.session;
    },
    async signUp(email, password) {
      if (!client) throw new Error("Configure o Supabase em config.js.");
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    async signOut() {
      if (client) await client.auth.signOut();
    },
    async load() {
      const current = await session();
      if (!current) return null;
      const { data, error } = await client.from("wedding_dashboards").select("data").eq("user_id", current.user.id).maybeSingle();
      if (error) throw error;
      return data?.data || null;
    },
    async save(data) {
      const current = await session();
      if (!current) return;
      const { error } = await client.from("wedding_dashboards").upsert({
        user_id: current.user.id,
        data,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
      if (error) throw error;
    },
    async upload(file) {
      const current = await session();
      if (!current) throw new Error("Entre na sua conta para enviar documentos.");
      const clean = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_");
      const path = `${current.user.id}/${crypto.randomUUID()}-${clean}`;
      const { error } = await client.storage.from(bucket).upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (error) throw error;
      return { path, name: file.name };
    },
    async signedUrl(path) {
      const { data, error } = await client.storage.from(bucket).createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
    onAuthChange(callback) {
      if (!client) return;
      client.auth.onAuthStateChange((_event, currentSession) => callback(currentSession));
    }
  };
})();
