document.addEventListener('DOMContentLoaded', function() {
    initDragSystem();
    // Garde tes autres initialisations existantes
});

function initDragSystem() {
    let draggedItem = null;
    let isDragging = false;
    let originalSectionId = null;
    let originalOrdre = null;

    // Ajouter le comportement de drag aux icônes ellipsis
    document.querySelectorAll('.section .post .fa-up-down-left-right.drag-handle').forEach(handle => {
        const post = handle.closest('.post');

        // Ne pas rendre draggable les posts épinglés
        if (!post.closest('.publications-epingles')) {

            handle.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Empêcher l'ouverture du menu d'options

                isDragging = true;
                draggedItem = post;
                post.classList.add('being-dragged');

                originalSectionId = post.closest('.section').getAttribute('data-section-id');
                originalOrdre = parseInt(post.getAttribute('data-ordre')) || 1;

                // Créer les zones de drop dans chaque section
                createDropZones();

                // Gérer le déplacement et le relâchement
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        }
    });

    function onMouseMove(e) {
        if (!isDragging) return;

        // Mise à jour de la position du post
        draggedItem.style.position = 'absolute';
        draggedItem.style.left = e.pageX - draggedItem.offsetWidth / 2 + 'px';
        draggedItem.style.top = e.pageY - 20 + 'px';

        // Détecter si on est au-dessus d'une zone de drop
        document.querySelectorAll('.drop-zone').forEach(zone => {
            const rect = zone.getBoundingClientRect();
            if (e.clientY > rect.top && e.clientY < rect.bottom) {
                zone.classList.add('drop-zone-active');
            } else {
                zone.classList.remove('drop-zone-active');
            }
        });
    }

    function onMouseUp(e) {
        if (!isDragging) return;

        const activeZone = document.querySelector('.drop-zone-active');
        if (activeZone) {
            const sectionId = activeZone.getAttribute('data-section-id');
            const targetSection = document.querySelector(`.section[data-section-id="${sectionId}"] .liste_posts`);

            if (targetSection) {
                // Retirer l'élément de son emplacement actuel
                if (draggedItem.parentNode) {
                    draggedItem.parentNode.removeChild(draggedItem);
                }

                // Insérer juste après la drop-zone
                activeZone.parentNode.insertBefore(draggedItem, activeZone.nextSibling);

                // Maintenant, recalculer l'ordre
                let previousPost = draggedItem.previousElementSibling;
                while (previousPost && !previousPost.classList.contains('post')) {
                    previousPost = previousPost.previousElementSibling;
                }

                let newOrdre = 1; // Valeur par défaut

                if (previousPost) {
                    const prevOrdre = parseInt(previousPost.getAttribute('data-ordre')) || 0;
                    newOrdre = prevOrdre + 1;
                }

                // Mettre à jour visuellement
                draggedItem.setAttribute('data-ordre', newOrdre);
                const id = draggedItem.getAttribute('data-id')

                updatePublicationPosition(parseInt(id),parseInt(sectionId), parseInt(newOrdre), parseInt(originalSectionId), parseInt(originalOrdre))


                // Envoi serveur ici (décommenter si besoin)
            }
        }

        // Nettoyer
        draggedItem.style.position = '';
        draggedItem.style.left = '';
        draggedItem.style.top = '';
        draggedItem.classList.remove('being-dragged');

        // Supprimer les zones de drop
        document.querySelectorAll('.drop-zone').forEach(zone => zone.remove());

        // Enlever les écouteurs d'événements
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        isDragging = false;
        draggedItem = null;
    }

    function createDropZones() {
        // D'abord, supprimer les zones existantes
        document.querySelectorAll('.drop-zone').forEach(zone => zone.remove());

        // Créer des zones de drop dans chaque section
        document.querySelectorAll('.section').forEach(section => {
            const postsList = section.querySelector('.liste_posts');
            const sectionId = section.getAttribute('data-section-id');

            if (!postsList) {
                // Si la section n'a pas de liste_posts, créer une
                const newPostsList = document.createElement('div');
                newPostsList.className = 'liste_posts';
                section.appendChild(newPostsList);

                // Ajouter une zone de drop avec ordre = 1 (premier élément)
                const dropZone = createDropZoneElement(sectionId, 1);
                newPostsList.appendChild(dropZone);
            } else {
                const posts = Array.from(postsList.querySelectorAll('.post:not(.being-dragged)'));

                // Trier les posts par ordre
                posts.sort((a, b) => {
                    return parseInt(a.getAttribute('data-ordre')) - parseInt(b.getAttribute('data-ordre'));
                });

                // Ajouter une zone avant le premier post (ordre = 1)
                if (posts.length > 0) {
                    const firstOrdre = Math.max(1, parseInt(posts[0].getAttribute('data-ordre')) - 1);
                    const firstZone = createDropZoneElement(sectionId, firstOrdre);
                    postsList.insertBefore(firstZone, posts[0]);
                }

                // Créer des zones entre chaque post
                for (let i = 0; i < posts.length - 1; i++) {
                    const currentOrdre = parseInt(posts[i].getAttribute('data-ordre'));
                    const nextOrdre = parseInt(posts[i+1].getAttribute('data-ordre'));

                    // Calcul de l'ordre intermédiaire
                    const middleOrdre = Math.floor((currentOrdre + nextOrdre) / 2);

                    const dropZone = createDropZoneElement(sectionId, middleOrdre);
                    postsList.insertBefore(dropZone, posts[i+1]);
                }

                // Ajouter une zone à la fin
                if (posts.length > 0) {
                    const lastPost = posts[posts.length - 1];
                    const lastOrdre = parseInt(lastPost.getAttribute('data-ordre')) + 1;
                    const lastZone = createDropZoneElement(sectionId, lastOrdre);
                    postsList.appendChild(lastZone);
                } else {
                    // S'il n'y a pas de posts, ajouter une zone avec ordre = 1
                    const emptyZone = createDropZoneElement(sectionId, 1);
                    postsList.appendChild(emptyZone);
                }
            }
        });
    }

    function createDropZoneElement(sectionId, ordre) {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.setAttribute('data-section-id', sectionId);
        dropZone.setAttribute('data-ordre', ordre);
        return dropZone;
    }
}

function updatePublicationPosition(publicationId, sectionId, ordre, originalSection, originalOrdre) {
    // Afficher un loader ou feedback
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingOverlay);

    console.log(publicationId, sectionId, ordre, originalSection, originalOrdre)

    // Appel AJAX pour mettre à jour la position
    fetch('/api/publication/update-position', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            id: publicationId,
            ordre: ordre,
            originalOrdre: originalOrdre,
            originalSectionId : originalSection,
            sectionId : sectionId
        })
    })
        .then(response => response.json())
        .then(data => {
            // Enlever le loader
            document.body.removeChild(loadingOverlay);

            if (data.success) {
                console.log('Position mise à jour avec succès');
                // Mettre à jour l'attribut data-ordre de l'élément déplacé
                const movedElement = document.querySelector(`.post[data-id="${publicationId}"]`);
                if (movedElement) {
                    movedElement.setAttribute('data-ordre', ordre);
                }
            } else {
                console.error('Erreur lors de la mise à jour de la position');
                // Éventuellement recharger la page pour rétablir l'état initial
                location.reload();
            }
        })
        .catch(error => {
            // Enlever le loader
            document.body.removeChild(loadingOverlay);
            console.error('Erreur:', error);
            // Recharger la page en cas d'erreur
            location.reload();
        });
}

// Ne pas oublier de conserver ton code existant pour les autres fonctionnalités
// comme la gestion des options quand on clique sur les ellipsis
document.querySelectorAll('.fa-up-down-left-right').forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.stopPropagation();
        // Fermer tous les autres menus
        document.querySelectorAll('.options_menu').forEach(menu => {
            if (menu !== this.nextElementSibling) {
                menu.classList.remove('active');
            }
        });
        // Toggle le menu actuel
        this.nextElementSibling.classList.toggle('active');
    });
});

// Fermer le menu quand on clique ailleurs
document.addEventListener('click', function() {
    document.querySelectorAll('.options_menu').forEach(menu => {
        menu.classList.remove('active');
    });
});