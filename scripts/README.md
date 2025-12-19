# Scripts de déploiement SuperSprint

Ce dossier contient le script pour déployer automatiquement SuperSprint vers Portainer CE.

## Configuration initiale

### 1. Créer un Access Token dans Portainer

1. Connectez-vous à votre instance Portainer
2. Allez dans **Settings** (icône d'engrenage) → **Access tokens**
3. Cliquez sur **Add access token**
4. Donnez un nom (ex: "supersprint-deploy")
5. Copiez le token généré (commence par `ptr_`)

### 2. Trouver votre Stack ID

1. Allez sur votre stack SuperSprint dans Portainer
2. Regardez l'URL de votre navigateur
3. L'URL ressemble à: `https://portainer.example.com/#!/1/docker/stacks/5`
4. Le dernier chiffre est votre Stack ID (ici: `5`)
5. Le premier chiffre est l'Endpoint ID (ici: `1`)

### 3. Configurer les variables d'environnement

Copiez le fichier d'exemple et remplissez-le:

```bash
cp .env.deploy.example .env.deploy
```

Éditez `.env.deploy` et remplissez avec vos valeurs:

```bash
PORTAINER_URL=https://votre-portainer.com
PORTAINER_API_KEY=ptr_votre_token_ici
PORTAINER_STACK_ID=5
PORTAINER_ENDPOINT_ID=1
```

**Important**: Ajoutez `.env.deploy` à votre `.gitignore` pour ne pas committer vos secrets!

## Utilisation

Lancez simplement le script de déploiement:

```bash
./scripts/deploy.sh
```

Le script charge automatiquement la configuration depuis `.env.deploy` et:
1. Build l'image Docker
2. Push vers Docker Hub (`blueint32/supersprint:latest`)
3. Déclenche le redéploiement dans Portainer via l'API
4. Portainer pull la nouvelle image et redémarre les containers

## Dépannage

### "Missing configuration"

Vérifiez que:
- Le fichier `.env.deploy` existe
- Toutes les variables sont remplies

### "Deployment failed with HTTP code: 401"

Votre API key est invalide ou expirée. Générez-en une nouvelle dans Portainer.

### "Deployment failed with HTTP code: 404"

Le Stack ID ou l'Endpoint ID est incorrect. Vérifiez l'URL de votre stack dans Portainer.

### "Deployment failed with HTTP code: 500"

Erreur serveur Portainer. Vérifiez:
- Que votre stack existe toujours
- Que le fichier docker-compose.yml de la stack est valide
- Les logs de Portainer

## Workflow recommandé

1. Faites vos modifications dans le code
2. Testez localement
3. Committez vos changements
4. Lancez `./scripts/deploy.sh`
5. Attendez quelques secondes
6. Vérifiez que la nouvelle version fonctionne

## Alternative: déploiement manuel

Si le script échoue, vous pouvez toujours:
1. Pusher manuellement: `docker push blueint32/supersprint:latest`
2. Dans Portainer, aller sur votre stack
3. Cliquer sur "Pull and redeploy"
