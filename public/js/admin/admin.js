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
    popupManager.openAddPopupUser()
    console.log('User')

}

function ajouterUE(){
    console.log('UE')
}

function supprimerUtilisateur(id){
   // On sait jamais si quelqu'un a modifié, donc je récupère les infos depuis la BDD
    fetch(`/admin/get-user/${id}`)
        .then(response => {
            if(!response.ok){
                throw new Error('Erreur lors de la récupération des données');
            }
            return response.json();
        })
        .then(user =>{
            if(user.error){
                throw new Error(user.error);
            }
            console.log("ok : " + user.toString()) ;
            window.popupManager.openDeleteUserPopup(id, user.nom, user.prenom, user.image);
        })
        .catch(error =>{
            console.log('Erreur delete user : ' + error)
            alert("Impossible de récuper les informations de l'utilisateur")
        })
}

function addUser(){
    const nom = document.getElementById('nom')
    const prenom = document.getElementById('prenom')
    const email = document.getElementById('email')
    const telephone = document.getElementById('telephone')

    const selectedRole = document.querySelectorAll('#check-button input[type="checkbox"]');

    console.log("SYUUUUUU")
    let selectedRoles = [];

    selectedRole.forEach(r => {
        console.log("ici")
        if (r.checked){
            selectedRoles.push(r.value);
        }
    })

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    let file_name = "default.jpg"

    if(file){
        file_name = file.name;
        console.log(file.name);
        console.log(file.type);
    }

    const selectedUE = document.querySelectorAll('.selected-options .tag');
    let allUeSelected = []

    selectedUE.forEach( ue => {
        allUeSelected.push(ue.dataset.value)
    })

    console.log(allUeSelected)
    console.log(selectedRoles)
}

/*
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
})*/
