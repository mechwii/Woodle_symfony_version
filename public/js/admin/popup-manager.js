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
        document.body.style.overflow = "hidden"

        const deleteButton = document.getElementById('confirm-delete');
        deleteButton.onclick = () => this.deleteUser(id);

        this.overlay.classList.remove('hidden');
    }

    closeAll() {
        this.overlay.classList.add('hidden');
        document.body.style.overflow = "scroll"


        document.querySelectorAll('.mini-popup, .popup').forEach(popup => {
            popup.classList.add('hidden');
        });
        this.resetAllForm()

    }

    resetAllForm(){
        const addUserForm = document.getElementById('add-user-popup');
        if (addUserForm) {
            // Réinitialiser les champs du formulaire
            document.getElementById('utilisateur_nom').value = '';
            document.getElementById('utilisateur_prenom').value = '';
            document.getElementById('utilisateur_email').value = '';
            document.getElementById('utilisateur_telephone').value = '';

            // Réinitialiser les cases à cocher des rôles
            document.querySelectorAll('#check-button input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });

            // Réinitialiser les UE sélectionnées
            document.getElementById('selected-options').innerHTML = '';
            document.querySelectorAll('.option.selected').forEach(opt => opt.classList.remove('selected'));
            document.getElementById('ue-input').value = '';

            // Réinitialiser l'image
            document.getElementById('fileInput').value = '';
            document.getElementById('prev-picture').src = 'images/profil/default.jpg';

            // Réinitialiser la prévisualisation
            document.getElementById('prev-firstname-section').innerHTML = '<strong>[Prénom]</strong>';
            document.getElementById('prev-name-section').innerHTML = '<strong>[Nom de famille]</strong>';
            document.getElementById('prev-mail-section').innerHTML = 'adresse@mail.com';
            document.getElementById('prev-ue').innerHTML = '';
        }
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


    openAddPopupUser(){
        document.getElementById('add-user-popup').classList.remove('hidden');
        document.body.style.overflow = "hidden"
        this.overlay.classList.remove('hidden');

        const addButton = document.getElementById('add-user-button');
        addButton.innerHTML = "Créer l'utilisateur";
        addButton.onclick = () => this.addUser();
    }

    addUser() {
        const nom = document.getElementById('utilisateur_nom').value;
        const prenom = document.getElementById('utilisateur_prenom').value;
        const email = document.getElementById('utilisateur_email').value;
        const telephone = document.getElementById('utilisateur_telephone').value;

        // Réinitialiser les messages d'erreur
        // clearValidationErrors();

        // Récupération des rôles sélectionnés
        const selectedRole = document.querySelectorAll('#check-button input[type="checkbox"]');
        let selectedRoles = [];

        selectedRole.forEach(r => {
            if (r.checked) {
                selectedRoles.push(r.value);
            }
        });

        // Récupération des UE sélectionnées
        const selectedUE = document.querySelectorAll('.selected-options .tag');
        let allUeSelected = [];

        selectedUE.forEach(ue => {
            allUeSelected.push(ue.dataset.value);
        });

        // Préparation des données à envoyer
        const userData = {
            nom: nom,
            prenom: prenom,
            email: email,
            telephone: telephone,
            roles: selectedRoles,
            ues: allUeSelected,
            image: "default.jpg" // Par défaut
        };

// Si un fichier est sélectionné, on l'upload d'abord
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if(file){
            const imageData = new FormData();
            imageData.append('file', file);
            imageData.append('nom', nom);



            fetch('/admin/upload-image', {
                method: 'POST',
                body: imageData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then( response => {
                if(!response.ok){
                    console.log(response.text())
                }
                return response.json()
            }).then(data => {
                if(data.success){
                    console.log('Succès : ' + data);
                    console.log(userData)

                    userData.image = data.image;
                    this.createUser(userData);
                } else{
                    // showError("Erreur lors de l'upload de l'image: " + (data.error || "Erreur inconnue"));
                }

            }).catch(error => {
                console.error('Erreur:', error);
             //   showError("Erreur lors de l'upload de l'image");
            })
        } else {
            this.createUser(userData);
        }
    }

    createUser(userData) {
        console.log(userData)
        fetch('/admin/add-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(userData)
        })
            .then(response => response.json())
            .then(data => {

                if (data.success) {
                    console.log(data.data)
                    // Fermer la popup
                    window.popupManager.closeAll();

                    // Rafraîchir la liste des utilisateurs ou ajouter le nouvel utilisateur à la liste
                    // sans recharger la page complète
                    this.addUserToList(data.user);

                    // Message de succès
                    // showSuccess("Utilisateur créé avec succès !");
                } else {
                    // Gestion des erreurs de validation
                    if (data.details && Array.isArray(data.details)) {
                        // Afficher chaque erreur de validation à côté du champ correspondant
                        // displayValidationErrors(data.details);
                        console.log(data.details)
                    } else {
                        // Afficher le message d'erreur général
                        //showError(data.error || "Erreur lors de la création de l'utilisateur");
                    }
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                //showError("Erreur lors de la création de l'utilisateur");
            });
    }

    addUserToList(user) {
        // Récupération du conteneur des utilisateurs
        const userContainer = document.querySelector('.card-container');

        const rolesTransformed = user.roles
            .map(r => {
                if (r === 'ROLE_ELEVE') return 'Élève';
                if (r === 'ROLE_ADMINISTRATEUR') return 'Administrateur';
                if (r === 'ROLE_PROFESSEUR') return 'Professeur';
                return r;
            })
            .join(' - ');

        if (userContainer) {
            // Création de la carte utilisateur
            const userCard = document.createElement('div');
            userCard.id = `user-${user.id}`;
            userCard.className = 'card-box';

            // Construction du HTML de la carte utilisateur
            userCard.innerHTML = `
                   <div class="card-left">
                        <img id="user-picture" src="images/profil/${user.image}"  alt="Photo de profil admin">
                        <div class="card-content">
                            <h4 id="name-firstname-section">${user.prenom} ${ user.nom }</h4>
                            <h4 id="roles-section" class="card-text">
                                ${rolesTransformed}
                            </h4>
                        </div>
                    </div>
                    <div class="card-action">
                        <i onclick="modifierUtilisateur(${user.id})" class="fa-solid fa-pen edit-icon edit"></i>
                        <i onclick="supprimerUtilisateur(${user.id})" class="fa-solid fa-trash edit-icon delete"></i>
                    </div>
        `;

            // Ajout de la carte au conteneur
            userContainer.appendChild(userCard);
        }
    }
    openModifyUserPopup(id, nom, prenom, email, image ,telephone, roles,ue){
        document.getElementById('utilisateur_id').value = id;

        console.log(id, nom, prenom, email, image ,telephone, roles,ue)
        document.getElementById('add-user-popup').classList.remove('hidden');
        document.body.style.overflow = "hidden"
        this.overlay.classList.remove('hidden');

        const addButton = document.getElementById('add-user-button');
        addButton.innerHTML = "Modifier l'utilisateur";

        document.getElementById('prev-firstname-section').innerHTML = `<strong>${prenom}</strong>`;
        document.getElementById('prev-name-section').innerHTML = `<strong>${nom}</strong>`;
        document.getElementById('prev-mail-section').innerHTML = `<strong>${email}</strong>`;
        document.getElementById('prev-picture').src = '/images/profil/' + image;

        document.getElementById('utilisateur_nom').value = nom;
        document.getElementById('utilisateur_prenom').value = prenom;
        document.getElementById('utilisateur_email').value = email;
        document.getElementById('utilisateur_telephone').value = telephone;

        const roleSection = document.querySelectorAll('.role-section #check-button input[type="checkbox"]');

        roleSection.forEach(checkbox => {
            const roleId = parseInt(checkbox.value);
            const hasRole = roles.some(role => role.id_role === roleId);
            checkbox.checked = hasRole;
        });

        if (ue && Array.isArray(ue)) {
            // Réinitialise les options sélectionnées
            document.querySelectorAll('.option.selected').forEach(opt => opt.classList.remove('selected'));
            document.getElementById('selected-options').innerHTML = '';

            ue.forEach(ueItem => {
                const code = ueItem.code; // ou `ueItem` si c’est un simple tableau de codes
                const option = document.querySelector(`.option[data-value="${code}"]`);

                if (option) {
                    option.classList.add('selected');

                    const tag = document.createElement('span');
                    tag.className = 'tag';
                    tag.dataset.value = code;
                    tag.innerHTML = `<i class="fa fa-code"></i> ${code} <span onclick="removeTag('${code}', event)">✖</span>`;

                    document.getElementById('selected-options').appendChild(tag);
                }
            });

            updateHiddenInput();
            updatePreviewUEList();
        }

        addButton.onclick = () => this.editUser();
    }

    editUser(){
        const id =document.getElementById('utilisateur_id').value;
        const nom = document.getElementById('utilisateur_nom').value;
        const prenom = document.getElementById('utilisateur_prenom').value;
        const email = document.getElementById('utilisateur_email').value;
        const telephone = document.getElementById('utilisateur_telephone').value;

        console.log(id)
        // Réinitialiser les messages d'erreur
        // clearValidationErrors();

        // Récupération des rôles sélectionnés
        const selectedRole = document.querySelectorAll('#check-button input[type="checkbox"]');
        let selectedRoles = [];

        selectedRole.forEach(r => {
            if (r.checked) {
                selectedRoles.push(parseInt(r.value));
            }
        });

        // Récupération des UE sélectionnées
        const selectedUE = document.querySelectorAll('.selected-options .tag');
        let allUeSelected = [];

        selectedUE.forEach(ue => {
            allUeSelected.push(ue.dataset.value);
        });


        // Préparation des données à envoyer
        const userData = {
            id : id,
            nom: nom,
            prenom: prenom,
            email: email,
            telephone: telephone,
            roles: selectedRoles,
            ues: allUeSelected,
            image: ""
        };

        console.log(userData.roles)
        console.log(userData.roles)
        console.log(userData.roles)
        console.log(userData.roles)



        // Si un fichier est sélectionné, on l'upload d'abord
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if(file){
            const imageData = new FormData();
            imageData.append('file', file);
            imageData.append('nom', nom);
            imageData.append('id_user', id)

            fetch('/admin/upload-image', {
                method: 'POST',
                body: imageData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then( response => {
                if(!response.ok){
                    console.log(response.text())
                }
                return response.json()
            }).then(data => {
                if(data.success){
                    console.log('Succès : ' + data);
                    console.log(userData)

                    userData.image = data.image;
                    this.modifyUser(userData);
                } else{
                    console.log("nein")
                    // showError("Erreur lors de l'upload de l'image: " + (data.error || "Erreur inconnue"));
                }

            }).catch(error => {
                console.error('Erreur:', error);
                //   showError("Erreur lors de l'upload de l'image");
            })
        } else {
            console.log(userData.id)
            this.modifyUser(userData);
        }
    }

    modifyUser(userData){
        fetch("/admin/edit-user/" + userData.id.trim() , {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(userData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('oui')
                    console.log(data)
                    // Fermer la popup
                    window.popupManager.closeAll();

                    // Rafraîchir la liste des utilisateurs ou ajouter le nouvel utilisateur à la liste
                    // sans recharger la page complète
                    this.editUserToList(data.user);

                    // Message de succès
                    // showSuccess("Utilisateur créé avec succès !");
                } else {
                    console.log('non')

                    // Gestion des erreurs de validation
                    if (data.details && Array.isArray(data.details)) {
                        // Afficher chaque erreur de validation à côté du champ correspondant
                        // displayValidationErrors(data.details);
                        console.log(data.details)
                    } else {
                        // Afficher le message d'erreur général
                        //showError(data.error || "Erreur lors de la création de l'utilisateur");
                    }
                }
            })
            .catch(error => {
                console.log('jsp')
                console.error('Erreur:', error);
                //showError("Erreur lors de la création de l'utilisateur");
            });

    }

    editUserToList(user) {
        // Utiliser l'ID dynamique basé sur l'ID de l'utilisateur
        const userCard = document.getElementById("user-" + user.id);

        if (!userCard) return; // Si l'élément n'existe pas, on sort

        // Mise à jour de l'image
        userCard.querySelector("img").src = "images/profil/" + user.image;

        // Mise à jour du nom et prénom
        userCard.querySelector(".card-content h4:first-child").innerHTML = user.prenom + " " + user.nom;

        // Transformation et mise à jour des rôles
        const rolesTransformed = user.roles
            .map(r => {
                if (r === 'ROLE_ELEVE') return 'Élève';
                if (r === 'ROLE_ADMINISTRATEUR') return 'Administrateur';
                if (r === 'ROLE_PROFESSEUR') return 'Professeur';
                return r;
            })
            .join(' - ');

        userCard.querySelector("#roles-section").innerHTML = rolesTransformed;
    }

}


document.addEventListener('DOMContentLoaded', () => {
    window.popupManager = new PopupManager();
})


// ELEMENT VISUEL DANS LES POPUP MAJORITAIREMENT DRAG AND DROP ET MULTI SELECT

// Ce fichier c'est esstentiellement pour la gestion des évènements visuels, en soit c'est des composants dans la popup
function dropZoneLoaded() {
    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
        const dropZoneElement = inputElement.closest(".drop-zone");

        dropZoneElement.addEventListener("click", (e) => {
            inputElement.click();
        });

        inputElement.addEventListener("change", (e) => {
            if (inputElement.files.length) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);
            }
        });

        dropZoneElement.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");
        });

        ["dragleave", "dragend"].forEach((type) => {
            dropZoneElement.addEventListener(type, (e) => {
                dropZoneElement.classList.remove("drop-zone--over");
            });
        });

        dropZoneElement.addEventListener("drop", (e) => {
            e.preventDefault();

            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }

            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    /**
     * Updates the thumbnail on a drop zone element.
     *
     * @param {HTMLElement} dropZoneElement
     * @param {File} file
     */
    function updateThumbnail(dropZoneElement, file) {
        let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

        // First time - remove the prompt
        if (dropZoneElement.querySelector(".drop-zone__prompt")) {
            dropZoneElement.querySelector(".drop-zone__prompt").remove();
            dropZoneElement.querySelector("div.separator").remove();
            dropZoneElement.querySelector("div.fake-button").remove();
        }

        // First time - there is no thumbnail element, so lets create it
        if (!thumbnailElement) {
            thumbnailElement = document.createElement("div");
            thumbnailElement.classList.add("drop-zone__thumb");
            dropZoneElement.appendChild(thumbnailElement);
        }

        thumbnailElement.dataset.label = file.name;

        // Show thumbnail for image files
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => {
                thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
                document.getElementById('prev-picture').src = reader.result;
            };
        } else {
            thumbnailElement.style.backgroundImage = null;
        }
    }

}

function changeFirstName(prenom){
    let result = prenom;
    if(result === ""){
        result = "[Prénom]"
    }
    document.getElementById('prev-firstname-section').innerHTML = `<strong>${result}</strong>`;

}


// Penser à gerer la taille
function changeLastName(nom){
    let result = nom;
    if(result === ""){
        result = "[Nom de famille]"
    }
    document.getElementById('prev-name-section').innerHTML = `<strong>${result}</strong>`;

}

function changeMail(mail){
    let result = mail;
    if(result === ""){
        result = "adresse@mail.com";
    }
    document.getElementById('prev-mail-section').innerHTML = `${result}`;

}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('utilisateur_nom').addEventListener('keyup', (event) =>{
        changeLastName(event.target.value)
    })

    document.getElementById('utilisateur_prenom').addEventListener('keyup', () =>{
        changeFirstName(event.target.value)

    })

    document.getElementById('utilisateur_email').addEventListener('keyup', () =>{
        changeMail(event.target.value)

    })

    dropZoneLoaded()
})


/* MULTISELECT */

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', closeDropdownOutside);
})

function toggleDropdown() {
    const select = document.getElementById('ue-select');
    const container = document.getElementById('option-container');

    select.classList.toggle('open');

    if (select.classList.contains('open')) {
        container.classList.remove('hidden');
        // document.getElementById('option-filter').focus(); // Optionnel si besoin focus input
        document.addEventListener('click', closeDropdownOutside);
    } else {
        container.classList.add('hidden');
        document.removeEventListener('click', closeDropdownOutside);
    }
}

function closeDropdownOutside(event) {
    const select = document.getElementById('ue-select');
    const container = document.getElementById('option-container');

    if (!select.contains(event.target)) {
        select.classList.remove('open');
        container.classList.add('hidden');
        document.removeEventListener('click', closeDropdownOutside);
    }
}


function filterOptions() {
    const filterValue = document.getElementById('option-filter').value.toLowerCase();
    const options = document.querySelectorAll('#options-list .option');

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(filterValue)) {
            option.classList.remove('hidden');
        } else {
            option.classList.add('hidden');
        }
    });
}

function toggleOption(el) {
    el.classList.toggle('selected');

    const selectedContainer = document.getElementById('selected-options');
    const value = el.dataset.value;

    if (el.classList.contains('selected')) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.dataset.value = value;
        tag.innerHTML = `<i class="fa fa-code"></i> ${value} <span onclick="removeTag('${value}', event)">✖</span>`;
        selectedContainer.appendChild(tag);
    } else {
        document.querySelector(`.tag[data-value="${value}"]`)?.remove();
    }

    updateHiddenInput();
    updatePreviewUEList();
}

function removeTag(value, event) {
    if (event) {
        event.stopPropagation(); // Si je fais pas ça quand je selectionne une UE le menu se feme
    }
    document.querySelector(`.option[data-value="${value}"]`)?.classList.remove('selected');
    document.querySelector(`.tag[data-value="${value}"]`)?.remove();
    updateHiddenInput();
    updatePreviewUEList();
}

function updateHiddenInput() {
    const tags = document.querySelectorAll('.selected-options .tag');
    const values = Array.from(tags).map(t => t.dataset.value);
    document.getElementById('ue-input').value = values.join(',');
}

function updatePreviewUEList() {
    const selectedUE = document.querySelectorAll('.selected-options .tag');
    const ListUe = document.getElementById('prev-ue');

    if (ListUe) {
        ListUe.innerHTML = ''; // On vide d'abord
    }

    if (selectedUE.length > 0) {
        selectedUE.forEach(tag => {
            const wrapperDiv = document.createElement('div');
            wrapperDiv.classList.add('ue-item');

            const icon = document.createElement('i');
            icon.classList.add('fa', 'fa-square-root-variable');

            const text = document.createElement('span');
            text.textContent = tag.dataset.value;

            wrapperDiv.appendChild(icon);
            wrapperDiv.appendChild(text);

            ListUe.appendChild(wrapperDiv);
        });
    }
}
