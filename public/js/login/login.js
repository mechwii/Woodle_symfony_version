// On doit attendre que la page charge sinon marche pas
document.addEventListener("DOMContentLoaded", function () {

    // Fonction asynchrone pour récupérer les stats depuis le backend via /get-stat
    async function getStat() {
        const result = await fetch('/get-stat');
        const data = await result.json();
        return data;
    }

    // Tableau qui contiendra les phrases
    let words = [];

    // Fonction d'initialisation
    async function init() {
        let word = await getStat(); // On récupère les stats depuis le backend
        // On crée les phrases avec les données reçues
        words = [`${word.stat_eleves} étudiants.`, `${word.stat_ues} Unités d'Enseignement.` ,`${word.stat_professeurs} Professeurs.`, `${word.stat_users} Utilisateurs.`]
        console.log(words);

        type(words[index]); // On commence l'animation de texte

    }




    let placeholder = document.getElementById("text");
    let index = 0; // Index pour suivre quelle phrase on affiche


    // Fonction pour écrire le texte lettre par lettre
    function type(word) {
        let i = 0;
        let writing = setInterval(() => {
            placeholder.innerHTML += word.charAt(i); // Ajoute une lettre à chaque intervalle
            i++;
            if (i >= word.length) {
                clearInterval(writing);  // On arrête quand tout est écrit
                setTimeout(erase, 1000); // On fait une pause avant d'effacer
            }
        }, 75)

    }

    // Fonction pour effacer le texte lettre par lettre
    function erase() {
        let deleting = setInterval(() => {
            placeholder.innerHTML = placeholder.innerHTML.slice(0, -1); // Supprime la dernière lettre
            if (placeholder.innerHTML.length <= 0) {
                clearInterval(deleting);  // Quand tout est effacé, on passe à la phrase suivante
                index++;
                if (index >= words.length) {
                    index = 0;
                }
                type(words[index]) // On affiche la prochaine
            }


        }, 25);

    }


    init();



    // Fonctionnalité pour afficher ou masquer le mot de passe
    document.getElementById("togglePassword").addEventListener("click", function () {
        var passwordInput = document.getElementById("password");
        if (passwordInput.type === "password") {
            passwordInput.type = "text"; // Affiche le mot de passe
        } else {
            passwordInput.type = "password"; // Masque le mot de passe
        }
    });

        const form = document.querySelector(".formulaire_connexion");
        const inputs = form.querySelectorAll("input[required]");
        const submitBtn = document.querySelector(".bouton_connexion");

        // Cette fonction s'assure qu'aucun champs n'est vide (même si le champs require était amplement suffisant)
        function checkInputs() {
            let allFilled = true;
            submitBtn.style.backgroundColor = "#EF233C";
            submitBtn.style.cursor = "pointer";
            inputs.forEach(input => {
                if (input.value.trim() === "") {
                    allFilled = false; // Si une valeur est différente le allFIled est faux on désactive le boutton
                    submitBtn.style.backgroundColor = "#444";
                    submitBtn.style.cursor = "not-allowed";
                }
            });
            submitBtn.disabled = !allFilled;
        }

        inputs.forEach(input => {
            input.addEventListener("input", checkInputs);
        }); // La on ajoute un listener à la modification de chaque input

        checkInputs();

});