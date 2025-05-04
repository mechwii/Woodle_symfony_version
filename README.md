# Woodle 

## Prérequis
- PHP 8.1 ou supérieur
- Composer
- PostgreSQL

## Installation et configuration

### 1. Configuration de la base de données
- Importer la base de données en utilisant l'un des fichiers suivants :
    - `script.sql` (structure + données) -> suffisant 
    - `backup.sql` (sauvegarde complète)
- Configurer les accès dans le fichier `.env` :
  ```env
  DATABASE_URL="postgresql://mhammedev:1206@127.0.0.1:5432/bdd_we4a?serverVersion=16&charset=utf8"

### 2. Installation des dépendances

- Exécuter la commande suivante pour installer toutes les dépendances

```bash
composer install
```

- Puis lancer le serveur symfony pour lancer l'application

```bash
symfony server:start
```

## Accès aux comptes

### Comptes administrateurs

- **Administrateur et professeur**
  - Email: thomas.martin@example.com
  - Mot de passe: martinPass

- **Administrateur**
  - Email: evrensan.vazmazz@example.com
  - Mot de passe: vazmazz789!

### Comptes utilisateurs

- **Professeur**
  - Email: elmiru.balonu@example.com
  - Mot de passe: securePass456

- **Elève**:
  - Email: mhammedu.san@example.com
  - Mot de passe: password123


