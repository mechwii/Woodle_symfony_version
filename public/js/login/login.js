// On doit attendre que la page charge sinon marche pas
document.addEventListener("DOMContentLoaded", function () {


    async function getStat() {
        const result = await fetch('/get-stat');
        const data = await result.json();
        return data;
    }


    let words = [];

    async function init() {
        let word = await getStat();
        words = [`${word.stat_eleves} étudiants.`, `${word.stat_ues} Unités d'Enseignement.` ,`${word.stat_professeurs} Professeurs.`, `${word.stat_users} Utilisateurs.`]
        console.log(words);

        type(words[index]);

    }




    let placeholder = document.getElementById("text");
    let index = 0;






    function type(word) {
        let i = 0;
        let writing = setInterval(() => {
            placeholder.innerHTML += word.charAt(i);
            i++;
            if (i >= word.length) {
                clearInterval(writing);
                setTimeout(erase, 1000);
            }
        }, 75)

    }

    function erase() {
        let deleting = setInterval(() => {
            placeholder.innerHTML = placeholder.innerHTML.slice(0, -1);
            if (placeholder.innerHTML.length <= 0) {
                clearInterval(deleting);
                index++;
                if (index >= words.length) {
                    index = 0;
                }
                type(words[index])
            }


        }, 25);

    }


    init();




    document.getElementById("togglePassword").addEventListener("click", function () {
        var passwordInput = document.getElementById("password");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
        } else {
            passwordInput.type = "password";
        }
    });
    document.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector(".formulaire_connexion");
        const inputs = form.querySelectorAll("input[required]");
        const submitBtn = document.querySelector(".bouton_connexion");

        function checkInputs() {
            let allFilled = true;
            submitBtn.style.backgroundColor = "#000";
            submitBtn.style.cursor = "pointer";
            inputs.forEach(input => {
                if (input.value.trim() === "") {
                    allFilled = false;
                    submitBtn.style.backgroundColor = "#444";
                    submitBtn.style.cursor = "not-allowed";
                }
            });
            submitBtn.disabled = !allFilled;
        }

        inputs.forEach(input => {
            input.addEventListener("input", checkInputs);
        });
        checkInputs();
    });
});