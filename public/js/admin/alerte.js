class Alerte{
    /**
     * Affiche une notification de succès avec le message fourni
     * @param message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Affiche une notification d'erreur avec le message fourni
     * @param message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Méthode générique qui gère l'affichage des notifications
     * @param message
     * @param type
     */
    showNotification(message, type) {
        // On vérifie si le conteneur de notifications existe déjà
        // Sinon, on le crée et on l’ajoute au body
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            document.body.appendChild(notificationContainer);
        }

        // Création de la notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Création de l'icône selon le type de message (succès ou erreur)
        const icon = document.createElement('div');
        icon.className = 'notification-icon';
        if (type === 'success') {
            // Icône de check (succès)
            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        } else {
            // Icône d’info ou d’erreur
            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        }

        // Contenu textuel de la notification
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.textContent = message;

        // Barre de progression visuelle pour montrer que la notif va disparaître
        const progressBar = document.createElement('div');
        progressBar.className = 'notification-progress';

        // On assemble tous les morceaux dans la notification
        notification.appendChild(icon);
        notification.appendChild(content);
        notification.appendChild(progressBar);

        // Et on ajoute la notif au conteneur
        notificationContainer.appendChild(notification);

        // Lancement de l'animation de la barre de progression
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 100);

        // Après 5 secondes, on fait disparaître la notification
        setTimeout(() => {
            notification.classList.add('fade-out');
            // Une fois l’animation de fade-out terminée, on la supprime du DOM
            setTimeout(() => {
                notification.remove();
                // Si c'était la dernière notif, on supprime le conteneur aussi
                if (notificationContainer.children.length === 0) {
                    notificationContainer.remove();
                }
            }, 300);
        }, 5000);
    }

}

// Quand la page est prête, on instancie notre classe Alerte
window.addEventListener('DOMContentLoaded', () =>{
    window.alerte = new Alerte();
})
