export interface KeycloakOptions {
  authServerUrl?: string;
  clientId?: string;
  debug?: boolean;
  realm?: string;
  realmPublicKey?: string;
  secret?: string;
  clientUniqueId?: string;
  adminUser?: string;
  adminPass?: string;
}
