class PopupManager {
    constructor() {
        this.overlay = document.getElementById('overlay');
        this.init();
    }

    init() {
        this.overlay.addEventListener('click', (event) => {
            if (event.target === this.overlay) {
                this.closeAll();
            }
        });

        document.querySelectorAll('[data-action="close-popup"]').forEach(element => {
            element.addEventListener('click', () => this.closeAll());
        });
    }

    openDeleteUserPopup(id, nom, prenom, image) {
        console.log(id, nom, prenom, image)
        document.getElementById('delete-user-popup').classList.remove('hidden');
        document.getElementById('picture-popup').src = `images/profil/${image}`;
        document.getElementById('user-name').textContent = `${prenom} ${nom}`;

        const deleteButton = document.getElementById('confirm-delete');
        deleteButton.onclick = () => this.deleteUser(id);

        this.overlay.classList.remove('hidden');
        document.getElementById('confirm-delete').style.display = 'block';
    }

    closeAll() {
        this.overlay.classList.add('hidden');

        document.querySelectorAll('.mini-popup, .popup').forEach(popup => {
            popup.classList.add('hidden');
        });
    }

    deleteUser(id) {
        fetch(`/admin/delete-user/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const userCard = document.getElementById(`user-${id}`);
                    if (userCard) {
                        userCard.remove();
                    }
                    this.closeAll();
                } else {
                    alert('Erreur lors de la suppression');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression');
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.popupManager = new PopupManager();
})
