const crypto = require('crypto');

// Rôles avec accès global (pas de filtre géographique)
const GLOBAL_ROLES = ['souverain', 'super_admin', 'admin_national'];

/**
 * Calcule le périmètre géographique de l'utilisateur.
 * Retourne null si l'utilisateur a un accès global.
 * Hiérarchie : national → zone → région → province → territoire → secteur
 */
const buildGeoScope = (user) => {
  if (!user || GLOBAL_ROLES.includes(user.role)) return null;

  const s = user.scope || {};
  const scope = {};

  // Zone Militaire
  if (s.zone) scope.zone = s.zone;
  if (s.zoneRef) scope.zoneRef = s.zoneRef;

  // Région Militaire
  if (s.region) scope.region = s.region;
  if (s.regionRef) scope.regionRef = s.regionRef;

  // Niveaux géographiques inférieurs
  if (s.province) scope.province = s.province;
  if (s.territoire) scope.territoire = s.territoire;
  if (s.secteur) scope.secteur = s.secteur;

  return Object.keys(scope).length ? scope : null;
};

/**
 * Middleware — attache req.geoScope et enrichit req.auditMeta.
 * À placer après protect() sur toutes les routes sensibles.
 */
const geoScope = (req, res, next) => {
  req.geoScope = buildGeoScope(req.user);

  // Métadonnées d'audit enrichies
  const ua = req.headers['user-agent'] || '';
  req.auditMeta = {
    ip: req.ip,
    userAgent: ua,
    methodeHTTP: req.method,
    endpoint: req.originalUrl,
    appareil: parseUserAgent(ua),
    scopeGeographique: req.user?.scope?.province
      ? [req.user.scope.province, req.user.scope.territoire, req.user.scope.secteur]
          .filter(Boolean)
          .join(' / ')
      : 'National',
    signatureNumerique: buildSignature(req),
  };

  next();
};

/**
 * Applique le scope géographique à un filtre Mongoose.
 * scopeMapping = { province: 'champ_province_dans_le_modèle', territoire: '...' }
 */
const applyScope = (filter, geoScope, scopeMapping) => {
  if (!geoScope || !scopeMapping) return filter;

  const merged = { ...filter };
  if (geoScope.province && scopeMapping.province) {
    merged[scopeMapping.province] = geoScope.province;
  }
  if (geoScope.territoire && scopeMapping.territoire) {
    merged[scopeMapping.territoire] = geoScope.territoire;
  }
  if (geoScope.secteur && scopeMapping.secteur) {
    merged[scopeMapping.secteur] = geoScope.secteur;
  }
  return merged;
};

// ─── Helpers privés ──────────────────────────────────────────────────────────

function parseUserAgent(ua) {
  const os = ua.includes('Windows') ? 'Windows'
    : ua.includes('Mac') ? 'macOS'
    : ua.includes('Linux') ? 'Linux'
    : ua.includes('Android') ? 'Android'
    : ua.includes('iOS') ? 'iOS'
    : 'Inconnu';

  const navigateur = ua.includes('Chrome') ? 'Chrome'
    : ua.includes('Firefox') ? 'Firefox'
    : ua.includes('Safari') ? 'Safari'
    : ua.includes('Edge') ? 'Edge'
    : 'Inconnu';

  const type = ua.includes('Mobile') ? 'mobile'
    : ua.includes('Tablet') ? 'tablet'
    : 'desktop';

  return { os, navigateur, type };
}

function buildSignature(req) {
  const payload = [
    req.method,
    req.originalUrl,
    req.user?._id?.toString() || 'anon',
    Date.now().toString(),
  ].join('|');
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 32);
}

module.exports = { geoScope, buildGeoScope, applyScope, GLOBAL_ROLES };
