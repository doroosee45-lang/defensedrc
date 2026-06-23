# MILSYS RDC — API Backend Reference

Base URL: `http://localhost:5000/api/v1`

## Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Connexion (matricule + mot de passe) |
| POST | `/auth/verify-mfa` | Vérification code OTP |
| POST | `/auth/refresh` | Renouveler le token |
| POST | `/auth/logout` | Déconnexion |
| GET | `/auth/me` | Profil utilisateur courant |
| POST | `/auth/setup-mfa` | Générer secret MFA + QR Code |
| POST | `/auth/enable-mfa` | Activer l'authentification MFA |
| PUT | `/auth/change-password` | Changer son mot de passe |

## Personnel

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/personnel` | Liste avec pagination/filtres |
| GET | `/personnel/stats` | Statistiques globales |
| GET | `/personnel/:id` | Détail d'un militaire |
| POST | `/personnel` | Créer un militaire |
| PUT | `/personnel/:id` | Modifier un militaire |
| DELETE | `/personnel/:id` | Supprimer |
| POST | `/personnel/:id/photo` | Upload photo |

## Grades

`GET/POST /grades` — `GET/PUT/DELETE /grades/:id`

## Unités

`GET/POST /unites` — `GET/PUT/DELETE /unites/:id`

## Opérations (Missions)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/operations` | Liste des missions |
| GET | `/operations/stats` | Stats par statut/type |
| POST | `/operations` | Créer une mission |
| PATCH | `/operations/:id/statut` | Changer le statut |
| POST | `/operations/:id/assigner` | Assigner du personnel |

## Présences

`GET/POST /presences` — `GET/PUT/DELETE /presences/:id`
- `GET /presences/militaire/:id` — Présences d'un militaire
- `PATCH /presences/:id/valider` — Valider une présence
- `GET /presences/stats` — Statistiques

## Permissions (Congés)

`GET/POST /permissions` — `GET/PUT/DELETE /permissions/:id`
- `PATCH /permissions/:id/approuver` — body: `{ decision: "approuvee"|"refusee", commentaire }`

## Médical

`GET/POST /medical` — `GET/PUT/DELETE /medical/:id`
- `GET /medical/militaire/:id`
- `POST /medical/:id/vaccination`
- `POST /medical/:id/consultation`
- `PATCH /medical/:id/aptitude`

## Disciplinaire

`GET/POST /disciplinaire` — `GET/PUT/DELETE /disciplinaire/:id`

## Financier

`GET/POST /financier` — `GET/PUT/DELETE /financier/:id`
- `GET /financier/masse-salariale?mois=&annee=`
- `PATCH /financier/:id/approuver`
- `PATCH /financier/:id/payer`

## Messagerie

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/messagerie/inbox` | Messages reçus |
| GET | `/messagerie/sent` | Messages envoyés |
| GET | `/messagerie/non-lus` | Compteur non lus |
| POST | `/messagerie` | Envoyer un message |
| PATCH | `/messagerie/:id/archive` | Archiver |

## Véhicules

`GET/POST /vehicules` — `GET/PUT/DELETE /vehicules/:id`

## Équipements

`GET/POST /equipements` — `GET/PUT/DELETE /equipements/:id`

## Logistique (Transferts)

`GET/POST /logistique` — `GET/PUT/DELETE /logistique/:id`

## Alertes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/alertes/actives` | Alertes actives uniquement |
| GET | `/alertes/stats` | Stats par niveau/type |
| POST | `/alertes/diffuser` | Diffusion temps réel (Socket.IO) |
| PATCH | `/alertes/:id/lue` | Marquer comme lue |
| PATCH | `/alertes/:id/traiter` | Traiter avec actions |

## Documents

`GET/POST /documents` — `GET/PUT/DELETE /documents/:id`
- `POST /documents/:id/upload` — Upload fichier (multipart/form-data)

## Bases Militaires

`GET/POST /bases` — `GET/PUT/DELETE /bases/:id`

## Géolocalisation

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/geolocalisation/all` | Toutes positions (personnel + véhicules + transferts) |
| GET | `/geolocalisation/personnel` | Positions du personnel |
| GET | `/geolocalisation/vehicules` | Positions des véhicules |
| PATCH | `/geolocalisation/personnel/:id` | MAJ position personnel |
| PATCH | `/geolocalisation/vehicules/:id` | MAJ position véhicule |

## Rapports

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/rapports/dashboard` | KPIs tableau de bord |
| GET | `/rapports/personnel?annee=` | Rapport personnel |
| GET | `/rapports/operations?annee=` | Rapport opérations |
| GET | `/rapports/financier?annee=` | Masse salariale |

## Audit

- `GET /audit` — Journal d'audit (admin+)
- `GET /audit/stats` — Statistiques d'audit
- `GET /audit/user/:id` — Audit par utilisateur

## Administration (Users)

- `GET /administration/users` — Liste utilisateurs
- `POST /administration/users` — Créer utilisateur
- `PUT /administration/users/:id` — Modifier
- `PATCH /administration/users/:id/toggle` — Activer/désactiver
- `PATCH /administration/users/:id/reset-password` — Réinitialiser mot de passe

---

## Authentification des requêtes

```
Authorization: Bearer <accessToken>
```

## Paramètres de pagination (GET)

```
?page=1&limit=20&sort=-createdAt&search=texte
```

## Socket.IO Events

| Event (client→serveur) | Description |
|------------------------|-------------|
| `authenticate` | `{ userId, uniteId }` — s'identifier |
| `send_message` | `{ destinataireId, ... }` — envoyer message |
| `position_update` | `{ type, id, lat, lng }` — MAJ GPS |

| Event (serveur→client) | Description |
|------------------------|-------------|
| `nouveau_message` | Nouveau message reçu |
| `nouvelle_alerte` | Alerte diffusée |
| `receive_message` | Message pour l'utilisateur |
| `position_update` | MAJ position GPS |

## Comptes par défaut (après `npm run seed`)

| Matricule | Mot de passe | Rôle |
|-----------|-------------|------|
| GEN-001-EMG | Admin@2024! | admin_national |
| ADM-003-SYS | SuperAdmin@2024! | super_admin |
| COL-002-EMG | User@2024! | officier_commandant |
