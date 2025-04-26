class Alerte{
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

// Function to show error notification
    showError(message) {
        this.showNotification(message, 'error');
    }

// Generic notification function
    showNotification(message, type) {
        // Create notification container if it doesn't exist
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            document.body.appendChild(notificationContainer);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Create icon element
        const icon = document.createElement('div');
        icon.className = 'notification-icon';
        if (type === 'success') {
            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        } else {
            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        }

        // Create content wrapper
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.textContent = message;

        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'notification-progress';

        // Assemble notification
        notification.appendChild(icon);
        notification.appendChild(content);
        notification.appendChild(progressBar);

        // Add to container
        notificationContainer.appendChild(notification);

        // Animate progress bar
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 100);

        // Remove notification after animation completes
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
                if (notificationContainer.children.length === 0) {
                    notificationContainer.remove();
                }
            }, 300);
        }, 5000);
    }

}

window.addEventListener('DOMContentLoaded', () =>{
    window.alerte = new Alerte();
})
