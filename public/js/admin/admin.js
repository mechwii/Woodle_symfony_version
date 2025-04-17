// En soit j'ai besoin d'un seul bouton pour ajouter une UE ou un User mais la popup est différent, j'utilise donc cette variable pour appeler des fonctions différentes
let variable_pour_boutton_ajout=1

function SelectUE() {
    variable_pour_boutton_ajout=2

    const categorie = document.getElementById('categorie-selected');
    categorie.style.transform = 'translateX(100%)';
    setTimeout(() => {
        document.getElementById('dashboard-selects').children.item(1).style.color = 'white';
        document.getElementById('dashboard-selects').children.item(0).style.color = 'black';
    }, 100);
    document.getElementById("user-content").style.display = "none";
    document.getElementById("ue-content").style.display = "block";

}

function SelectUser() {
    variable_pour_boutton_ajout=1

    document.getElementById('categorie-selected').style.transform = 'translateX(0)';
    setTimeout(() => {
        document.getElementById('dashboard-selects').children.item(0).style.color = 'white';
        document.getElementById('dashboard-selects').children.item(1).style.color = 'black';
    }, 100);
    document.getElementById("ue-content").style.display = "none";
    document.getElementById("user-content").style.display = "block";
}

function handleAjout(){
    variable_pour_boutton_ajout === 1 ? ajouterUser() : ajouterUE();
}
function ajouterUser(){
    console.log('User')

}

function ajouterUE(){
    console.log('UE')

}

