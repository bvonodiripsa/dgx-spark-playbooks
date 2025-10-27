/**
 * Client-side initialization utilities
 * This file contains functions for initializing the application on the client side
 */

/**
 * Initialize default database settings if not already set
 * Called before syncing with server to ensure defaults are available
 */
export function initializeDefaultSettings() {
  if (typeof window === 'undefined') {
    return; // Only run on client side
  }

  // Set default graph DB type based on what's available in the deployment
  // Check if JENA_ENDPOINT is set (client-side check via API call would be needed for server env vars)
  if (!localStorage.getItem('graph_db_type')) {
    // Default to arangodb, but this can be overridden by the server
    // The server will sync the correct default based on environment
    localStorage.setItem('graph_db_type', 'arangodb');
  }

  // Set default ArangoDB settings if not set
  if (!localStorage.getItem('arango_url')) {
    localStorage.setItem('arango_url', 'http://localhost:8529');
  }

  if (!localStorage.getItem('arango_db')) {
    localStorage.setItem('arango_db', 'txt2kg');
  }

  // Set default Jena configuration if not already set
  if (!localStorage.getItem('jena_endpoint')) {
    localStorage.setItem('jena_endpoint', 'http://localhost:3030');
  }
  if (!localStorage.getItem('jena_dataset')) {
    localStorage.setItem('jena_dataset', 'ds');
  }

  // Set default Ollama model if not already set
  if (!localStorage.getItem('selected_ollama_models')) {
    localStorage.setItem('selected_ollama_models', JSON.stringify(['llama3.1:8b']));
  }

  // Set default selected model to Ollama if not set
  if (!localStorage.getItem('selectedModel')) {
    const defaultOllamaModel = {
      id: 'ollama-llama3.1:8b',
      name: 'Ollama llama3.1:8b',
      model: 'llama3.1:8b',
      provider: 'ollama',
      baseURL: 'http://localhost:11434/v1'
    };
    localStorage.setItem('selectedModel', JSON.stringify(defaultOllamaModel));
  }
}

/**
 * Synchronize settings from localStorage with the server
 * Called on app initialization to ensure server has access to client settings
 */
export async function syncSettingsWithServer() {
  if (typeof window === 'undefined') {
    return; // Only run on client side
  }

  // Fetch server settings first to get environment-based defaults (like DEFAULT_GRAPH_DB_TYPE)
  try {
    const response = await fetch('/api/settings');
    if (response.ok) {
      const data = await response.json();
      const serverSettings = data.settings || {};

      // If server has a graph_db_type (from environment), override the client default
      // This allows the Docker environment to set the default database type
      if (serverSettings.graph_db_type) {
        const currentType = localStorage.getItem('graph_db_type');
        // Only override if not already set by user, or if it's still the default 'arangodb'
        if (!currentType || currentType === 'arangodb') {
          console.log(`Setting graph database type from server environment: ${serverSettings.graph_db_type}`);
          localStorage.setItem('graph_db_type', serverSettings.graph_db_type);
        }
      }
    }
  } catch (error) {
    console.log('Could not fetch server settings, using local defaults:', error);
  }

  // Initialize other default settings
  initializeDefaultSettings();

  // Collect all relevant settings from localStorage
  const settings: Record<string, string> = {};

  // NVIDIA API settings
  const nvidiaEmbeddingsModel = localStorage.getItem('nvidia_embeddings_model');
  if (nvidiaEmbeddingsModel) {
    settings.nvidia_embeddings_model = nvidiaEmbeddingsModel;
  }

  const embeddingsProvider = localStorage.getItem('embeddings_provider');
  if (embeddingsProvider) {
    settings.embeddings_provider = embeddingsProvider;
  }

  // Graph Database selection
  const graphDbType = localStorage.getItem('graph_db_type');
  if (graphDbType) {
    settings.graph_db_type = graphDbType;
  }

  // Neo4j settings
  const neo4jUrl = localStorage.getItem('neo4j_url');
  if (neo4jUrl) {
    settings.neo4j_url = neo4jUrl;
  }

  const neo4jUser = localStorage.getItem('neo4j_user');
  if (neo4jUser) {
    settings.neo4j_user = neo4jUser;
  }

  const neo4jPassword = localStorage.getItem('neo4j_password');
  if (neo4jPassword) {
    settings.neo4j_password = neo4jPassword;
  }

  // ArangoDB settings
  const arangoUrl = localStorage.getItem('arango_url');
  if (arangoUrl) {
    settings.arango_url = arangoUrl;
  }

  const arangoDb = localStorage.getItem('arango_db');
  if (arangoDb) {
    settings.arango_db = arangoDb;
  }

  const arangoUser = localStorage.getItem('arango_user');
  if (arangoUser) {
    settings.arango_user = arangoUser;
  }

  const arangoPassword = localStorage.getItem('arango_password');
  if (arangoPassword) {
    settings.arango_password = arangoPassword;
  }

  // xAI API settings
  const xaiApiKey = localStorage.getItem('XAI_API_KEY');
  if (xaiApiKey) {
    settings.XAI_API_KEY = xaiApiKey;
  }

  // NVIDIA Nemotron API key
  const nvidiaApiKey = localStorage.getItem('NVIDIA_API_KEY');
  if (nvidiaApiKey) {
    settings.NVIDIA_API_KEY = nvidiaApiKey;
  }

  // Pinecone settings
  const pineconeApiKey = localStorage.getItem('pinecone_api_key');
  if (pineconeApiKey) {
    settings.pinecone_api_key = pineconeApiKey;
  }

  const pineconeEnvironment = localStorage.getItem('pinecone_environment');
  if (pineconeEnvironment) {
    settings.pinecone_environment = pineconeEnvironment;
  }

  const pineconeIndex = localStorage.getItem('pinecone_index');
  if (pineconeIndex) {
    settings.pinecone_index = pineconeIndex;
  }

  // Skip the API call if there are no settings to sync
  if (Object.keys(settings).length === 0) {
    return;
  }

  // Send settings to server
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    console.log('Client settings synchronized with server');
  } catch (error) {
    console.error('Failed to sync settings with server:', error);
  }
} 