document.addEventListener("DOMContentLoaded", function () {
    // Gestion des popups options (les 3 points)
    document.querySelectorAll(".top_post").forEach(post => {
        const ellipsis = post.querySelector(".ellipsis_icon");
        const optionsMenu = post.querySelector(".options_menu");

        ellipsis.addEventListener("click", function (event) {
            event.stopPropagation();

            document.querySelectorAll(".options_menu").forEach(menu => {
                if (menu !== optionsMenu) {
                    menu.style.display = "none";
                }
            });

            optionsMenu.style.display = optionsMenu.style.display === "block" ? "none" : "block";
        });
    });

    document.addEventListener("click", function () {
        document.querySelectorAll(".options_menu").forEach(menu => {
            menu.style.display = "none";
        });
    });


    const buttonPublication = document.querySelector('button.add_post');
    const popupCreatePublication = document.querySelector('div.popupPublication');
    const darkBackground = document.querySelector('div.darkBackground');

// Ouvre la popup
    buttonPublication.addEventListener('click', function (e) {
        e.stopPropagation(); // Pour éviter que le clic ferme directement la popup
        darkBackground.classList.remove('hidden');
        popupCreatePublication.classList.remove('hidden');
    });

// Ferme la popup si on clique en dehors
    document.addEventListener('click', function (e) {
        // Si le clic est en dehors de la popup ET pas sur le bouton
        if (!popupCreatePublication.contains(e.target) && !buttonPublication.contains(e.target)) {
            darkBackground.classList.add('hidden');
            popupCreatePublication.classList.add('hidden');
        }
    });

    const switchBg = document.querySelector('.switch-background');
    const boutonText = document.querySelector('.boutonsSwitch .text');
    const boutonFile = document.querySelector('.boutonsSwitch .file');
    const formulaireContainer = document.querySelector('.formulaireContainer');

    function afficherFormulaire(type) {
        if (type === 'texte') {
            formulaireContainer.innerHTML = `
            <h3>Formulaire Texte</h3>
            <form>
                <input type="text" placeholder="Titre" required><br>
                <textarea placeholder="Contenu..." rows="4" required></textarea><br>
                <button type="submit">Envoyer</button>
            </form>
        `;
        } else if (type === 'fichier') {
            formulaireContainer.innerHTML = `
            <h3>Formulaire Fichier</h3>
            <form>
                <input type="text" placeholder="Nom du fichier" required><br>
                <input type="file" required><br>
                <button type="submit">Uploader</button>
            </form>
        `;
        }
    }

// Déclencheurs
    boutonText.addEventListener('click', () => {
        switchBg.style.left = '0%';
        afficherFormulaire('texte');
    });

    boutonFile.addEventListener('click', () => {
        switchBg.style.left = '50%';
        afficherFormulaire('fichier');
    });

// Formulaire initial par défaut
    afficherFormulaire('texte');

    // Code pour faire switch la liste des users / profs

    const switchBgListe = document.querySelector('.switch-background-liste');
    const boutonStudent = document.querySelector('.boutonsSwitchListes .student');
    const boutonTeacher = document.querySelector('.boutonsSwitchListes .teacher');
    const containerListe = document.querySelector('.containerListe');

    const listeData = document.getElementById('liste-data');
    const eleves = JSON.parse(listeData.dataset.eleves);
    const profs = JSON.parse(listeData.dataset.profs);

    function afficherFormulaire(type) {
        if (type === 'student') {
            containerListe.innerHTML = `
            <h3>Liste des étudiants</h3>
            <div class="liste-etudiants">
                ${eleves.map(user => `
                    <div class="row-user">
                        <span class="prenom">${user.prenom}</span>
                        <span class="nom">${user.nom}</span>
                        <span class="email">${user.email}</span>
                        <img src="${user.photo}" alt="photo de ${user.prenom}">
                    </div>
                `).join('')}
            </div>
        `;
        } else if (type === 'teacher') {
            containerListe.innerHTML = `
            <h3>Liste des étudiants</h3>
            <div class="liste-professeurs">
                ${profs.map(user => `
                    <div class="row-user">
                        <span class="prenom">${user.prenom}</span>
                        <span class="nom">${user.nom}</span>
                        <span class="email">${user.email}</span>
                        <img src="${user.photo}" alt="photo de ${user.prenom}">
                    </div>
                `).join('')}
            </div>
        `;
        }
    }

// Déclencheurs
    boutonStudent.addEventListener('click', () => {
        switchBgListe.style.left = '0%';
        afficherFormulaire('student');
    });

    boutonTeacher.addEventListener('click', () => {
        switchBgListe.style.left = '50%';
        afficherFormulaire('teacher');
    });

// Formulaire initial par défaut
    afficherFormulaire('student');


});


// Fonction pour le formulaire
// Lorsque je clique sur le bouton une div apparait
// et derriere un fond noir
// La div est caché dans le code html a la fin
// elle est en display:none
// quand je clique elle passe en display:flex
// dedans j'ai le titre et j'ai le p switch.

