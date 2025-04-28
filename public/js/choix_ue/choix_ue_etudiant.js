/*
document.addEventListener("DOMContentLoaded", () => {
 // on va recuperer tous les éléments dont a besoin : bouton de nav, element souligné, et le conteneur des éléments pour faire lanimation
 let items = document.querySelectorAll('.selection_cours li');
 let underline = document.querySelector('.underline');
 let wrapper = document.querySelector('.nav-wrapper');

 // la fonction va prendre en parametre lelement actif et va calculer sa distance par rapport au cote gauche de son parent
 // en gros on recup lespace de gauche par rapport a la page de lelement du menu ex : 100
 // pareil pour le divwrapper qui est le conteneur ex 50
 // et je veux donc calculer sa position a linterieur pour ca je fais : espace gacueh de enfant - espace gauche de parent = 100 - 50 ca veut dire quil est distant de 50 a linterieur du parent par rapport a son bord gauche

 function moveUnderline(elementActif) {
     let rect = elementActif.getBoundingClientRect();
     let wrapperRect = wrapper.getBoundingClientRect();
     underline.style.width = `${rect.width}px`;
     underline.style.left = `${rect.left - wrapperRect.left}px`;
 }

 // pour chaque item on modifie la classe et on lance la fonction en consequence
 items.forEach(item => {
     item.addEventListener('click', () => {
         document.querySelector('.selection_cours li.active')?.classList.remove('active');
         item.classList.add('active');
         moveUnderline(item);
     });
 });

 // pour placer la barre au chargement de la page au tout debut quand on a encore cliqué nul part
 let active = document.querySelector('.selection_cours li.active');
 if (active) moveUnderline(active);


});*/


// ici on va gerer laffichage des ue dans la partie "mes cours"

document.addEventListener("DOMContentLoaded", () => {
    let offset = 4;
    const limit = 4;

    // on recupere les boutons qui permettent de filtrer
    const filtres = document.querySelectorAll(".selection_cours li");
    // on recupere le container des numeros de page pour naviguer entre les UE
    const dotsContainer = document.querySelector(".carousel-dots");
    // on recupere le container des cours
    const coursContainer = document.querySelector(".liste_ue");
    // ici on recupere tous les cours
    let allCours = Array.from(coursContainer.querySelectorAll(".ue"));
    // ici on initialise currentCours avec tous les cours car quand on arrive sur la page on affiche dabord tous les cours
    let currentCours = allCours;
    // ici petite variable pour dire cb de cours on affiche
    const coursParPage = 6;

    // Fonction pour calculer cb de pages seront crées en bas
    const createDots = (nbPages) => {
        dotsContainer.innerHTML = ""; // dabord on reset pour que ce soit vide
        // ensuite boucle for qui va compter le nombre de pages quon a recu en parametre
        // et on va toutes les compter pour faire le nombre de boutons de page en bas
        for (let i = 0; i < nbPages; i++) {
            // ici on crée lelement dot c le numero de page, et on lui donne la classe dot et active-dot si c le tout premier car on commence toujours a la page 1
            const dot = document.createElement("div");
            dot.classList.add("dot");
            if (i === 0) dot.classList.add("active-dot");
            // on lui donne un data-page qui correspond a son numero
            dot.dataset.page = i;
            // et ici vu quon commence a 0 on fait +1 pour avoir le nombre au dessus car les humains comptnetn a partir de 1 et pas 0
            dot.textContent = i + 1;
            // on met chaque num de page dans le container des pages.
            dotsContainer.appendChild(dot);

            // a chaque click on met a jour le style du bouton de changement de page
            dot.addEventListener("click", () => {
                updateDots(i);
            });
        }
    };

    // fonction de mise a jour des nums de page au niveau visuel
    // on prend en parametre le numero de data-page
    const updateDots = (page) => {
        const dots = dotsContainer.querySelectorAll(".dot");
        // on enleve la classe .active-dot pour reset à 0
        dots.forEach(dot => dot.classList.remove("active-dot"));
        // on rajoute alors la classe active-dot seulement au dot qui correspond à la page obtenu en parametre
        if (dots[page]) dots[page].classList.add("active-dot");
        // ici on calcule lintervalle delements a afficher (les cours) si on affiche 6 elements par page
        const start = page * coursParPage; // ex : si la page en param est 0 alors 0*6 = 0 = start
        const end = start + coursParPage; // ex : 0 + 6 = 6 = end, // pour la page 1 ce sera 6 et 12 etc...
        allCours.forEach(c => c.style.display = "none"); // on cache tous les cours pour repartir de 0

        // on affiche que les cours par page correspondante, ex pour page 0 ceux qui ont lindex=data-page 0 à 5
        currentCours.forEach((ue, index) => {
            if (index >= start && index < end) ue.style.display = "flex";
        });
    };

    /*
    // Filtres
    filtres.forEach((filtre) => {
        filtre.addEventListener("click", () => {
            // on reset le style à défaut pour tous
            filtres.forEach(f => f.classList.remove("active"));
            filtre.classList.add("active");

            // on prend le texte du menu et on afficeh en fonction de son nom les bonnes ue, favoris, recemment consultés ou tous.
            const type = filtre.textContent.trim().toLowerCase();
            if (type === "favoris") {
                currentCours = allCours.filter(c => c.classList.contains("favorite-true"));
            } else if (type === "derniers cours consultés") {
                currentCours = allCours.filter(c => c.classList.contains("recent-true"));
            } else {
                currentCours = allCours;
            }

            // on calucle le nombre de pages en tout en arrondissant ou supérieur si c 2,3 par exemple alors ce sera 3 pages.
            const nbPages = Math.ceil(currentCours.length / coursParPage);
            createDots(nbPages);
            updateDots(0);
        });
    });
    */


    // on initialise au début
    const nbPagesInitial = Math.ceil(currentCours.length / coursParPage);
    createDots(nbPagesInitial);
    updateDots(0);


    // Partie 2 : Gestion du bouton "Afficher plus"
    const afficherPlusBtn = document.getElementById('afficherPlus');
    const notificationsList = document.getElementById('notifications-list');


    window.updateNotif = function (){
        fetch(`/notifications?offset=${offset}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);

                data.notifications.forEach(notification => {
                    const li = document.createElement('li');
                    let iconClass = 'lni lni-comment-1'; // Par défaut

                    if (notification.type_notification_id === 1) {
                        iconClass = 'lni lni-books-2';
                    } else if (notification.type_notification_id === 5) {
                        iconClass = 'lni lni-file-multiple';
                    }

                    li.className = notification.type_notification_id === 1 ? 'affectation' :
                        notification.type_notification_id === 3 ? 'fichier' : 'message';

                    li.innerHTML = `
                            <i class="${iconClass}"></i>
                            <a href="${notification.url_destination}">
                                <b>${notification.nom}</b> ${notification.contenu} <b>${notification.code_id}</b>
                            </a>
                        `;
                    notificationsList.appendChild(li);
                });

                offset += limit;

                if (!data.showMoreButton) {
                    afficherPlusBtn.style.display = 'none';
                }
            })
            .catch(error => console.error('Erreur lors du chargement des notifications :', error));

    }

});

function removeUrgentNotif(id){
    fetch(`notifications/update-priorite/${id}`)
        .then(response => response.json())
        .then(data => {
            console.log('sqd')
            if(data.success){
                document.getElementById('notification-'+id).classList.remove('important-notif');
                const important = document.getElementById('important-'+id);
                if(important){
                    important.innerHTML = '';
                }

                document.querySelector(`#notification-${id} #delete-notif-urgent`).remove();
            } else {
                if(data.message){
                    throw new Error(data.message);

                } else {
                    throw new Error("Impossible d'update la notification");

                }
            }
        })
        .catch(error => {
            console.error(error);

        });
    ///

}


