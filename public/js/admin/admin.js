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

function supprimerUtilisateur(id, nom, prenom, image){
    let element = document.getElementById('overlay');
    let miniPopup = document.getElementById('mini-popup');

    element.classList.remove('hidden');
    //miniPopup.classList.remove('hidden');
    document.getElementById('overlay').innerHTML = `
    <div class="mini-popup">
        <p class="close-popup" onclick="closePopup()">X</p>
        <div class="mini-popup-content">
                <div class="mini-picture-place">
            <img id="picture-popup" src="images/profil/${image}" alt="Image de Jean Dupont">
        </div>
        <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>${prenom} ${nom}</strong> ?</p>
        <div class="bouton-container">
            <p onclick="closePopup()" class="bouton but-cancel">Annuler</p>
            <p onclick="deleteUser( ${id} )" class="bouton but-delete">Supprimer</p>
        </div>
        </div>

    </div>
    `
}

function deleteUser(id){
    fetch(`/admin/delete-user/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(response => response.json())
        .then(data => {
            if (data.success) {
                const userCard = document.getElementById(`user-${id}`);
                if (userCard) {
                    userCard.remove();
                }
                closePopup();
            } else {
                alert('Erreur lors de la suppression');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression');
        });
}

function supprimerUE(){

}

function closePopup(){
    document.getElementById('overlay').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('overlay').addEventListener('click', (event) => {
        // On veut uniquement fermer quand on clique en dehors donc on doit vérfier qu'on clique sur l'overlay
        if (event.target === document.getElementById('overlay')) {
            closePopup();
        }
    });
})
