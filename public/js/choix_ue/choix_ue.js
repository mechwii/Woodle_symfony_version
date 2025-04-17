// Fonction pour afficher plus d'actualités.

// Fonction pour faire une petite animation sur la barre de menu des cours en rouge

document.addEventListener("DOMContentLoaded", (event) => {



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

});

// Logique d'affichage des pages en dessous :
document.addEventListener("DOMContentLoaded", () => {
    const filtres = document.querySelectorAll(".selection_cours li");
    const cours = document.querySelectorAll(".liste_ue .ue");

    filtres.forEach((filtre, index) => {
        filtre.addEventListener("click", () => {

            // Logique de filtrage
            if (filtre.textContent.trim().toLowerCase() === "favoris") {
                cours.forEach(ue => {
                    ue.style.display = ue.classList.contains("favorite-true") ? "flex" : "none";
                });
            } else {
                // Affiche tout pour "Tous" ou autre filtre
                cours.forEach(ue => ue.style.display = "flex");
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const filtres = document.querySelectorAll(".selection_cours li");
    const dots = document.querySelectorAll(".carousel-dots .dot");
    const coursContainer = document.querySelector(".liste_ue");
    let allCours = Array.from(coursContainer.querySelectorAll(".ue"));
    let currentCours = allCours;

    const updateAffichage = (coursToShow) => {
        // Affiche les 4 premiers seulement
        allCours.forEach(c => c.style.display = "none");
        coursToShow.forEach((ue, index) => {
            ue.style.display = (index < 4) ? "flex" : "none";
        });
    };

    const updateDots = (page) => {
        dots.forEach(dot => dot.classList.remove("active-dot"));
        dots[page].classList.add("active-dot");

        // Affiche les 4 cours correspondant à la page
        const start = page * 6;
        const end = start + 6;
        allCours.forEach(c => c.style.display = "none");
        currentCours.forEach((ue, index) => {
            if (index >= start && index < end) ue.style.display = "flex";
        });
    };

    // Filtres
    filtres.forEach((filtre) => {
        filtre.addEventListener("click", () => {
            filtres.forEach(f => f.classList.remove("active"));
            filtre.classList.add("active");

            const type = filtre.textContent.trim().toLowerCase();
            if (type === "favoris") {
                currentCours = allCours.filter(c => c.classList.contains("favorite-true"));
            } else {
                currentCours = allCours;
            }

            // Réinitialise la pagination
            updateDots(0);
        });
    });

    // Dots (pagination)
    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            const page = parseInt(dot.dataset.page);
            updateDots(page);
        });
    });

    // Initialisation
    updateDots(0);
});
