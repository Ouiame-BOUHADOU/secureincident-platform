# SecureIncident — Plateforme de gestion des incidents informatiques

## 1. Présentation du projet

**SecureIncident** est une application web permettant aux employés d'une entreprise de déclarer des incidents informatiques et d'en suivre le traitement.

La plateforme propose trois rôles : **EMPLOYEE**, **TECHNICIAN** et **ADMIN**. Chaque rôle dispose d'un espace dédié et de permissions adaptées à ses responsabilités.

Le projet est développé avec une architecture client-serveur :

- **Backend :** Spring Boot, Spring Security, JWT, Spring Data JPA.
- **Frontend :** React, Vite, React Router et Axios.
- **Base de données :** MySQL.
- **Authentification :** JWT avec mots de passe chiffrés à l'aide de BCrypt.

## 2. Prérequis

Avant de lancer le projet, installer les outils suivants :

| Outil | Utilisation |
|---|---|
| Java 21 | Exécution du backend |
| Maven 3.10+ | Gestion et compilation du backend |
| Node.js et npm | Exécution du frontend |
| MySQL 8 | Base de données |
| Git | Gestion du code source |

## 3. Configuration de la base de données

Créer une base de données MySQL nommée :

```sql
CREATE DATABASE secureincident_db;
```

Créer un utilisateur MySQL dédié à l'application et lui accorder les permissions nécessaires sur cette base.

Le profil MySQL utilise les paramètres suivants :

- Hôte : `localhost`
- Port : `3306`
- Base de données : `secureincident_db`
- Utilisateur par défaut : `secureincident_app`

Les identifiants MySQL sont configurés à travers des variables d'environnement. Le mot de passe ne doit pas être enregistré dans le dépôt Git.

## 4. Variables d'environnement

Le backend utilise des variables d'environnement afin de séparer les paramètres sensibles du code source.

| Variable | Description |
|---|---|
| `DB_USERNAME` | Nom de l'utilisateur MySQL. Valeur par défaut : `secureincident_app`. |
| `DB_PASSWORD` | Mot de passe de l'utilisateur MySQL. |
| `JWT_SECRET` | Clé secrète Base64 utilisée pour signer et vérifier les JWT. |
| `BOOTSTRAP_ADMIN_EMAIL` | Adresse e-mail du premier administrateur à créer automatiquement. |
| `BOOTSTRAP_ADMIN_PASSWORD` | Mot de passe initial de cet administrateur. |

### Configuration sous Windows PowerShell

Ouvrir PowerShell et définir les variables avant de lancer le backend :

```powershell
$env:DB_USERNAME="secureincident_app"
$env:DB_PASSWORD="VOTRE_MOT_DE_PASSE_MYSQL"

$env:BOOTSTRAP_ADMIN_EMAIL="admin@secureincident.local"
$env:BOOTSTRAP_ADMIN_PASSWORD="VOTRE_MOT_DE_PASSE_ADMIN"
```

Générer une clé JWT aléatoire de 32 octets encodée en Base64 :

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
```

**Important :**
- Remplacer les valeurs d'exemple par les informations correspondant à votre environnement.
- Ne jamais publier les mots de passe ou la clé JWT dans GitHub.
- Ces variables définies dans PowerShell sont disponibles dans la session courante. Si une nouvelle fenêtre PowerShell est ouverte, il faut les définir à nouveau.
- L'administrateur initial est créé automatiquement lorsque les deux variables `BOOTSTRAP_ADMIN_EMAIL` et `BOOTSTRAP_ADMIN_PASSWORD` sont renseignées et qu'aucun compte administrateur correspondant n'existe déjà.

La durée de validité d'un JWT est configurée à **15 minutes (900 000 millisecondes)**.

## 5. Lancement du backend

Ouvrir un terminal PowerShell et accéder au dossier backend :

```powershell
cd secureincident-platform\backend
```

Vérifier que les variables d'environnement précédentes sont définies, puis lancer Spring Boot avec le profil MySQL :

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

Le backend sera accessible à l'adresse :

`http://localhost:8080`

Les API REST sont accessibles sous le préfixe :

`http://localhost:8080/api`

## 6. Lancement du frontend React

Ouvrir un deuxième terminal et accéder au dossier frontend :

```powershell
cd secureincident-platform\frontend
```

Installer les dépendances :

```powershell
npm install
```

Démarrer le serveur de développement :

```powershell
npm run dev
```

Le frontend sera accessible à l'adresse :

`http://localhost:5173`

L'application communique avec le backend à travers Axios. Les requêtes protégées transmettent automatiquement le JWT dans l'en-tête HTTP `Authorization: Bearer <token>`.

## 7. Ports utilisés

| Composant | Adresse | Port |
|---|---|---|
| Frontend React / Vite | `http://localhost:5173` | 5173 |
| Backend Spring Boot | `http://localhost:8080` | 8080 |
| Base de données MySQL | `localhost` | 3306 |

Le backend autorise les requêtes CORS provenant de `http://localhost:5173`.

## 8. Comptes de test et rôles

La plateforme possède trois rôles :

| Rôle | Responsabilités |
|---|---|
| `EMPLOYEE` | Déclarer des incidents et consulter ses propres incidents. |
| `TECHNICIAN` | Consulter les incidents qui lui sont assignés, mettre à jour leur statut et ajouter des commentaires. |
| `ADMIN` | Gérer les utilisateurs, créer des techniciens, consulter tous les incidents, assigner les incidents et clôturer les incidents résolus. |

### Compte administrateur

Le compte administrateur initial est créé à partir des variables :

- E-mail : `admin@secureincident.local` (valeur d'exemple configurable).
- Mot de passe : défini avec `BOOTSTRAP_ADMIN_PASSWORD`.
- Rôle : `ADMIN`.

### Compte employé

Un compte employé peut être créé directement depuis la page **Register** de l'application.

L'inscription publique attribue automatiquement le rôle `EMPLOYEE`. Il n'est pas possible de choisir un rôle privilégié lors de l'inscription.

### Compte technicien

Un compte technicien est créé par un administrateur depuis l'espace d'administration.

L'administrateur renseigne le nom complet, l'adresse e-mail et le mot de passe initial du technicien.

**Remarque :** les comptes employés et techniciens doivent être créés avant leur utilisation. Leurs identifiants dépendent des données enregistrées dans la base de données.

## 9. Principaux endpoints REST

Toutes les routes ci-dessous sont préfixées par `/api`. Les routes protégées nécessitent un JWT valide, sauf indication contraire.

### 9.1 Authentification

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| POST | `/auth/register` | Inscription d'un nouvel employé | Public |
| POST | `/auth/login` | Authentification et génération du JWT | Public |

### 9.2 Gestion du profil

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/profile` | Consulter son profil | Authentifié |
| PUT | `/profile` | Modifier son nom et son adresse e-mail | Authentifié |
| PUT | `/profile/password` | Modifier son mot de passe | Authentifié |

### 9.3 Gestion des incidents

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| POST | `/incidents` | Déclarer un nouvel incident | EMPLOYEE |
| GET | `/incidents/my` | Consulter ses propres incidents | EMPLOYEE |
| GET | `/incidents/assigned` | Consulter les incidents assignés | TECHNICIAN |
| GET | `/incidents` | Consulter tous les incidents | ADMIN |
| GET | `/incidents/{incidentId}` | Consulter les détails d'un incident autorisé | Selon les permissions |
| PUT | `/incidents/{incidentId}/assign/{technicianId}` | Assigner un incident à un technicien | ADMIN |
| PUT | `/incidents/{incidentId}/status` | Modifier le statut d'un incident selon les règles métier | TECHNICIAN / ADMIN |

### 9.4 Commentaires et historique

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| POST | `/incidents/{incidentId}/comments` | Ajouter un commentaire à un incident | TECHNICIAN assigné |
| GET | `/incidents/{incidentId}/comments` | Consulter les commentaires | Selon les permissions |
| GET | `/incidents/{incidentId}/history` | Consulter l'historique des actions | Selon les permissions |

### 9.5 Administration

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/admin/users` | Consulter la liste des utilisateurs | ADMIN |
| PUT | `/admin/users/{userId}/enable` | Activer un compte utilisateur | ADMIN |
| PUT | `/admin/users/{userId}/disable` | Désactiver un compte utilisateur | ADMIN |
| GET | `/admin/statistics` | Consulter les statistiques globales | ADMIN |
| POST | `/admin/technicians` | Créer un compte technicien | ADMIN |

## 10. Fonctionnalités réalisées

### Authentification et sécurité

- Inscription publique réservée aux employés.
- Connexion avec génération d'un JWT.
- Authentification sans état (stateless) avec Spring Security.
- Stockage sécurisé des mots de passe avec BCrypt.
- Gestion des rôles et contrôle d'accès aux endpoints.
- Vérification de la validité et de l'expiration des JWT.
- Déconnexion automatique côté frontend en cas de réponse HTTP 401.
- Protection des routes React selon le rôle de l'utilisateur.
- Validation des données reçues côté backend.

### Espace employé

- Déclaration d'un nouvel incident informatique.
- Consultation des incidents personnels.
- Affichage des statistiques et des incidents récents.
- Consultation et modification du profil.
- Changement du mot de passe.

### Espace technicien

- Consultation des incidents assignés.
- Affichage des statistiques : incidents assignés, incidents critiques, incidents en cours et incidents résolus.
- Consultation des détails d'un incident.
- Passage d'un incident de `ASSIGNED` à `IN_PROGRESS`, puis à `RESOLVED`.
- Ajout de commentaires pour documenter les interventions.
- Consultation de l'historique des actions.

### Espace administrateur

- Consultation de tous les utilisateurs.
- Activation et désactivation des comptes.
- Création de comptes techniciens.
- Consultation de tous les incidents.
- Affectation des incidents aux techniciens.
- Clôture des incidents après leur résolution.
- Tableau de bord avec statistiques globales sur les utilisateurs et les incidents.

### Gestion du cycle de vie des incidents

Les incidents suivent le cycle de vie suivant :

`OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED`

Les transitions sont contrôlées côté backend afin de respecter les règles métier et les permissions associées aux rôles.

### Historique et commentaires

- Enregistrement des actions importantes dans l'entité `IncidentHistory`.
- Conservation de l'auteur, de l'action, des détails et de la date.
- Ajout de commentaires par le technicien assigné.
- Consultation des commentaires et de l'historique selon les autorisations.

## 11. Règles de sécurité et règles métier

Les principales règles appliquées sont :

1. Un utilisateur qui s'inscrit publiquement obtient automatiquement le rôle `EMPLOYEE`.
2. Un utilisateur ne peut pas s'attribuer le rôle `ADMIN` ou `TECHNICIAN` lors de son inscription.
3. Un employé ne peut consulter que ses propres incidents.
4. Un technicien ne peut consulter et modifier que les incidents qui lui sont assignés.
5. Seul un administrateur peut assigner un incident à un technicien.
6. Un technicien ne peut faire progresser que les statuts autorisés.
7. Un administrateur ne peut clôturer qu'un incident déjà résolu.
8. Un utilisateur désactivé ne peut pas se connecter.
9. Les données reçues sont validées côté backend.
10. Les opérations sensibles sont contrôlées côté serveur, et pas uniquement dans l'interface React.

## 12. Structure générale du projet

```text
secureincident-platform/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/secureincident/backend/
│   │       │   ├── config/
│   │       │   ├── controller/
│   │       │   ├── dto/
│   │       │   ├── entity/
│   │       │   ├── enums/
│   │       │   ├── exception/
│   │       │   ├── repository/
│   │       │   ├── security/
│   │       │   └── service/
│   │       └── resources/
│   │           ├── application.properties
│   │           └── application-mysql.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## 13. Conclusion

SecureIncident met en œuvre une application de gestion des incidents informatiques reposant sur une architecture Spring Boot / React. Le projet intègre une authentification JWT, une gestion des rôles, un contrôle d'accès aux ressources, un suivi du cycle de vie des incidents, un historique des actions et une interface adaptée aux différents profils utilisateurs.

L'objectif est de proposer une plateforme fonctionnelle tout en appliquant les principes fondamentaux de la sécurité applicative : authentification, autorisation, validation des entrées, protection des données et contrôle des opérations sensibles.