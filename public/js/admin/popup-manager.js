class PopupManager {

    constructor() {
        this.overlay = document.getElementById('overlay');
        this.popupCat = 1;
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
        if (this.popupCat === 1) {
            console.log('ouch1')

            // Réinitialiser les champs du formulaire
            document.getElementById('utilisateur_nom').value = '';
            document.getElementById('utilisateur_prenom').value = '';
            document.getElementById('utilisateur_email').value = '';

            // Réinitialiser les cases à cocher des rôles
            document.querySelectorAll('#check-button input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });


            // Réinitialiser les options sélectionnées dans la liste
            document.querySelectorAll('.option.selected').forEach(opt => {
                opt.classList.remove('selected');
            });


            // Réinitialiser l'image
            document.getElementById('fileInput').value = '';
            document.getElementById('prev-picture').src = 'images/profil/default.jpg';

            // Réinitialiser la prévisualisation
            document.getElementById('prev-firstname-section').innerHTML = '<strong>[Prénom]</strong>';
            document.getElementById('prev-name-section').innerHTML = '<strong>[Nom de famille]</strong>';
            document.getElementById('prev-mail-section').innerHTML = 'adresse@mail.com';


        }
        else{
            document.getElementById('fileInput2').value = '';

            document.getElementById('prev-code-section').innerHTML = '<strong>[Code]</strong>';
            document.getElementById('prev-nomUe-section').innerHTML = `<strong>[Nom de l'UE]</strong>`;

            document.getElementById('ue_id').value = '';
            document.getElementById('ue_nom').value = '';

            document.getElementById('ue_id').disabled = false




        }
        resetDropZone()
        resetAllMultiSelect();
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
                    this.editStat();
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


    async openAddPopupUser(){

        this.loadUEOptions('user-options-list', 'user');

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
            imageData.append('dest', '/public/images/profil/')



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
                    this.editStat();
                    this.closeAll();
                    this.addUserToList(data.user);
                    showSuccess("Utilisateur créé avec succès !");
                } else {
                    // Gestion des erreurs de validation
                    if (data.details && Array.isArray(data.details)) {
                        // displayValidationErrors(data.details);
                        console.log(data.details)
                    } else {
                        // Afficher le message d'erreur général
                        // showError(data.error || "Erreur lors de la création de l'utilisateur");
                    }
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                //showError("Erreur lors de la création de l'utilisateur");
            });
    }

    // Méthodes utilitaires pour la gestion des erreurs
    resetErrorDisplay() {
        // Supprimer tous les messages d'erreur
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        // Réinitialiser les styles des champs
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
        // Cacher l'erreur générale si elle existe
        const generalError = document.getElementById('general-error');
        if (generalError) generalError.remove();
    }

    displayFieldErrors(errors) {
        errors.forEach(errorMsg => {
            // Trouver le champ correspondant au message d'erreur
            const fieldNames = ['nom', 'prenom', 'email'];
            const matchedField = fieldNames.find(field =>
                errorMsg.toLowerCase().includes(field)
            );

            if (matchedField) {
                this.displaySingleError(matchedField, errorMsg);
            }
        });
    }

    displaySingleError(fieldName, message) {
        const field = document.querySelector(`[name="utilisateur[${fieldName}]"]`);
        if (!field) return;

        // Ajouter la classe d'erreur au champ
        field.classList.add('input-error');

        // Créer le message d'erreur
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        // Insérer après le champ
        field.insertAdjacentElement('afterend', errorElement);
    }

    displayRoleError(message) {
        const roleSection = document.querySelector('.role-section');
        if (!roleSection) return;

        // Créer le message d'erreur
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        // Ajouter au début de la section rôle
        roleSection.prepend(errorElement);
    }

    displayGeneralError(message) {
        // Créer ou mettre à jour l'erreur générale
        let errorBox = document.getElementById('general-error');
        if (!errorBox) {
            errorBox = document.createElement('div');
            errorBox.id = 'general-error';
            errorBox.className = 'error-box';
            // Insérer au début du formulaire
            const form = document.querySelector('.add-form');
            form?.prepend(errorBox);
        }
        errorBox.textContent = message;
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

    async openModifyUserPopup(id, nom, prenom, email, image, roles,ue){

        document.getElementById('utilisateur_id').value = id;

        console.log(id, nom, prenom, email, image, roles,ue)
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

        const roleSection = document.querySelectorAll('.role-section #check-button input[type="checkbox"]');

        roleSection.forEach(checkbox => {
            const roleId = parseInt(checkbox.value);
            const hasRole = roles.some(role => role.id_role === roleId);
            checkbox.checked = hasRole;
        });

        console.log('test212')
        // Des fois cette fonction est appelé avant que les éléments soit chargés, donc lors du premier click ça m'affichait pas les UE
        this.loadUEOptions('user-options-list', 'user', () => {
            if (ue && Array.isArray(ue)) {
                document.querySelectorAll('.option.selected').forEach(opt => opt.classList.remove('selected'));
                document.getElementById('user-selected-options').innerHTML = '';

                ue.forEach(ueItem => {
                    const code = ueItem.code;
                    const noms = ueItem.nom;

                    const option = document.querySelector(`.option[data-value="${code}"]`);
                    if (option) {
                        option.classList.add('selected');

                        const tag = document.createElement('span');
                        tag.className = 'tag';
                        tag.dataset.value = code;
                        tag.dataset.nom = noms;
                        tag.innerHTML = `<i class="fa fa-code"></i> ${noms} <span onclick="removeTag('${code}', event, 'user')">✖</span>`;
                        document.getElementById('user-selected-options').appendChild(tag);
                    }
                });

                updateHiddenInput('user');
                updatePreviewUEList('user');
            }
        });

        addButton.onclick = () => this.editUser();
    }

    editUser(){
        const id =document.getElementById('utilisateur_id').value;
        const nom = document.getElementById('utilisateur_nom').value;
        const prenom = document.getElementById('utilisateur_prenom').value;
        const email = document.getElementById('utilisateur_email').value;

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
            roles: selectedRoles,
            ues: allUeSelected,
            image: ""
        };

        // Si un fichier est sélectionné, on l'upload d'abord
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if(file){
            const imageData = new FormData();
            imageData.append('file', file);
            imageData.append('nom', nom);
            imageData.append('prenom', prenom);
            imageData.append('id_user', id)
            imageData.append('dest', '/public/images/profil/')

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

                    console.log("IMAGE : ",data.image)
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

                    this.editStat();
                    this.closeAll();
                    this.editUserToList(data.user);

                    showSuccess("Utilisateur modifié avec succès !");
                } else {
                    console.log('non')

                    if (data.details && Array.isArray(data.details)) {
                        // displayValidationErrors(data.details);
                        console.log(data.details)
                    } else {
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

    loadUEOptions(containerId, nomDuMultiselect = 'user', callback) {
        fetch('/admin/get-ue')
            .then(res => res.json())
            .then(ueList => {

                console.log(ueList)
                const optionsList = document.getElementById(containerId);
                optionsList.innerHTML = ''; // On vide l'ancien contenu

                ueList.forEach(unite => {
                    const div = document.createElement('div');
                    div.className = 'option';
                    div.dataset.value = unite.code;
                    div.dataset.nom = unite.nom;
                    div.onclick = () => toggleOption(div, nomDuMultiselect);
                    div.innerHTML = `<i class="fa fa-code"></i> ${unite.nom}`;
                    optionsList.appendChild(div);
                });
                if(callback) callback();
            })
            .catch(error => {
                console.error("Erreur lors du chargement des UE", error);
            });
    }

    openAddPopupUE(){
        document.getElementById('add-ue-popup').classList.remove('hidden');
        document.body.style.overflow = "hidden"
        this.overlay.classList.remove('hidden');

        const addButton = document.getElementById('add-ue-button');
        addButton.innerHTML = "Créer l'UE";
        addButton.onclick = () => this.addUe();
        this.getResponsable();
        this.getUtilisateurAffectable();

    }

    getResponsable(responsable_id){
        fetch('/admin/get-responsables')
            .then(res => res.json())
            .then(data => {
                console.log(data)
                const responsableSelect = document.getElementById('ue_responsable_id'); // ID du select
                responsableSelect.innerHTML = ''; // On vide le select avant d'ajouter les nouvelles options

                const options = document.createElement('option');
                options.value = '';
                options.textContent = "Choisissez un responsable";
                responsableSelect.appendChild(options);

                data.forEach(responsable => {
                    const option = document.createElement('option');
                    option.value = responsable.id;
                    option.textContent = responsable.name;
                    if(responsable_id && responsable_id === responsable.id)
                    {
                        console.log("ICI")
                        option.selected = true;
                    }
                    responsableSelect.appendChild(option);

                });
            })
            .catch(error => {
                console.error("Erreur lors du chargement des responsables", error);
            });

    }

    getUtilisateurAffectable(callback){
        fetch('/admin/get-utilisateurs-affectable')  // Route à créer côté serveur
            .then(res => res.json())
            .then(data => {
                console.log("Utilisateurs:", data);
                const optionsList = document.getElementById('ue-options-list');
                optionsList.innerHTML = '';

                data.forEach(utilisateur => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    optionDiv.onclick = function() { toggleOption(this, 'ue'); };
                    optionDiv.setAttribute('data-value', utilisateur.id);
                    optionDiv.setAttribute('data-nom', utilisateur.nom);

                    const icon = document.createElement('i');
                    icon.className = 'fa-regular fa-user';

                    optionDiv.appendChild(icon);
                    optionDiv.appendChild(document.createTextNode(` ${utilisateur.nom}`));

                    optionsList.appendChild(optionDiv);

                    if(callback) callback()

                });
            })
            .catch(error => {
                console.error("Erreur lors du chargement des utilisateurs", error);
            });
    }

    addUe(){
        const selectedUser = document.querySelectorAll('.selected-options .tag');
        let allUserSelected = [];

        selectedUser.forEach(ue => {
            allUserSelected.push(ue.dataset.value);
        });

        const ueData = {
            id: document.getElementById('ue_id').value,
            nom: document.getElementById('ue_nom').value,
            responsable_id: document.getElementById('ue_responsable_id').value || null,
            utilisateurs: allUserSelected,
            image: 'default-ban.jpg'
        };

        /*if (!ueData.id || !ueData.nom) {
            console.error('Veuillez remplir tous les champs obligatoires');
            return;
        }*/

        /*if (!ueData.responsable_id) {
            console.error('Veuillez remplir tous les champs obligatoires');
            return;
        }*/

        const fileInput = document.getElementById('fileInput2');
        const file = fileInput.files[0];

        if(file){
            const imageData = new FormData();
            imageData.append('file', file);
            imageData.append('dest', '/public/images/ue/')

            fetch('/admin/upload-image', {
                method: 'POST',
                body: imageData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then( response => {
                if(!response.ok){
                    console.log(response.text());
                }
                return response.json();
            }).then( data => {
                if(data.success){
                    ueData.image = data.image;
                    this.createUe(ueData);
                } else {
                    console.log("erreur impossible d'upload l'image")
                    // showError("Erreur lors de l'upload de l'image: " + (data.error || "Erreur inconnue"));
                }
            }).catch(e => {
                console.error('Erreur ', e)
            })
        } else {
            this.createUe(ueData);

        }
    }

    createUe(userData){
        console.log(JSON.stringify(userData))
        fetch('/admin/add-ue', {
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

                    this.editStat();
                    this.closeAll();
                    this.addUEToList(data.ue);
                    showSuccess("Utilisateur créé avec succès !");
                } else {
                    // Gestion des erreurs de validation
                    if (data.details && Array.isArray(data.details)) {
                        // displayValidationErrors(data.details);
                        console.log(data.details)
                    } else {
                        // Afficher le message d'erreur général
                        // showError(data.error || "Erreur lors de la création de l'UE");
                    }
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                //showError("Erreur lors de la création de l'UE");
            });

    }


    /**
     * Ajoute l'UE nouvellement créée à la liste des UEs dans l'interface
     * @param {Object} ue - L'objet UE retourné par l'API
     */
    addUEToList(ue) {
        const ueContent = document.getElementById('ue-content');
        if (!ueContent) return;

        // Créer un nouvel élément de carte UE
        const cardBox = document.createElement('div');
        cardBox.className = 'card-box';
        cardBox.id = 'ue-'+ue.id;

        // Récupérer les noms du responsable (si disponible)
        let nomResponsable = ue.responsable_nom;
        let prenomResponsable = ue.responsable_prenom;


        // Construire le HTML de la carte
        cardBox.innerHTML = `
        <div class="card-left">
            <img id="ue-picture" src="./images/ue/${ue.image}" alt="Image UE">
            <div class="card-content" id="ue-${ue.id}">
                <h4>${ue.nom}</h4>
                <h4 class="card-text">Responsable : ${prenomResponsable} ${nomResponsable}</h4>
            </div>
        </div>
        <div class="card-action">
            <i onclick="modifierUE('${ue.id}')" class="fa-solid fa-pen edit-icon edit"></i>
            <i onclick="supprimerUE('${ue.id}')" class="fa-solid fa-trash edit-icon delete"></i>
        </div>
    `;

        ueContent.appendChild(cardBox);

    }

    openEditPopupUE(code, nom, responsable_id, responsable_nom, image, affecte) {
        console.log("ICI ! ", code, nom, responsable_id, responsable_nom, affecte);

        // Affiche la popup
        document.getElementById('add-ue-popup').classList.remove('hidden');
        document.body.style.overflow = "hidden";
        this.overlay.classList.remove('hidden');

        // Bouton Modifier
        const addButton = document.getElementById('add-ue-button');
        addButton.innerHTML = "Modifier l'UE";
        addButton.onclick = () => this.editUE();

        // Pré-remplir les champs texte
        document.getElementById('ue_id').value = code;
        document.getElementById('ue_id').disabled = true;



        document.getElementById('ue_nom').value = nom;


        this.getResponsable(responsable_id);

        document.getElementById('ue_responsable_id').value = responsable_id
        document.getElementById('prev-code-section').innerHTML = `<strong>${code}</strong>`
        document.getElementById('prev-nomUe-section').innerHTML = `<strong>${nom}</strong>`

        document.getElementById('prev-picture-ue').src = 'images/ue/' + image;

        this.getUtilisateurAffectable(() => {

            document.querySelectorAll('.option.selected').forEach(opt => opt.classList.remove('selected'));
            document.getElementById('ue-selected-options').innerHTML = '';

            affecte.forEach(userItem => {
                const code = userItem.id;
                const noms = userItem.nom + " " + userItem.prenom;

                const option = document.querySelector(`.option[data-value="${code}"]`);
                if (option) {
                    option.classList.add('selected');

                    const tag = document.createElement('span');
                    tag.className = 'tag';
                    tag.dataset.value = code;
                    tag.dataset.nom = noms;
                    tag.innerHTML = `<i class="fa fa-user"></i> ${noms} <span onclick="removeTag('${code}', event, 'ue')">✖</span>`;
                    document.getElementById('ue-selected-options').appendChild(tag);
                }
            });

            updateHiddenInput('ue');
            updatePreviewUEList('ue');
        });

    }


    editUE(){
        console.log("Modification")
        const fullPath = document.getElementById('prev-picture-ue').src;
        const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);

       const selectedUser = document.querySelectorAll('.selected-options .tag');
        let allUserSelected = [];

        selectedUser.forEach(ue => {
            allUserSelected.push(ue.dataset.value);
        });

        const ueData = {
            id: document.getElementById('ue_id').value,
            nom: document.getElementById('ue_nom').value,
            responsable_id: document.getElementById('ue_responsable_id').value || null,
            utilisateurs: allUserSelected,
            image: fileName
        };

        const fileInput = document.getElementById('fileInput2');
        const file = fileInput.files[0];

        if(file){
            const imageData = new FormData();
            imageData.append('file', file);
            imageData.append('dest', '/public/images/ue/')
            imageData.append('code', document.getElementById('ue_id').value);


            fetch('/admin/upload-image', {
                method: 'POST',
                body: imageData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then( response => {
                if(!response.ok){
                    console.log(response.text());
                }
                return response.json();
            }).then( data => {
                if(data.success){
                    ueData.image = data.image;
                    this.modifyUE(ueData);
                } else {
                    console.log("erreur impossible d'upload l'image")
                    // showError("Erreur lors de l'upload de l'image: " + (data.error || "Erreur inconnue"));
                }
            }).catch(e => {
                console.error('Erreur ', e)
            })
        } else {
            this.modifyUE(ueData);

        }
    }

    modifyUE(data){
        console.log(data);
        fetch("/admin/edit-ue/" + data.id.trim() , {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    this.editStat();
                    this.closeAll();
                    this.editUEToList(data.ue);

                    showSuccess("UE modifié avec succès !");
                } else {
                    console.log('non')

                    if (data.details && Array.isArray(data.details)) {
                        // displayValidationErrors(data.details);
                        console.log(data.details)
                    } else {
                        //showError(data.error || "Erreur lors de la création de l'utilisateur");
                    }
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                //showError("Erreur lors de la création de l'utilisateur");
            });

    }

    editUEToList(data){
        const userCard = document.getElementById("ue-" + data.id);

        if (!userCard) return;

        userCard.querySelector(".card-left img").src = "images/ue/" + data.image;

        // Mise à jour du nom et prénom
        userCard.querySelector(".card-content h4:first-child").innerHTML = data.nom;

        userCard.querySelector("#ue-roles-section").innerHTML = 'Responsable : ' + data.responsable_prenom + " " + data.responsable_nom;

    }

    openDeleteUEPopup(code, nom, image){
        console.log(code, nom, image)
        document.getElementById('delete-ue-popup').classList.remove('hidden');
        document.getElementById('picture-popup-ue').src = `images/ue/${image}`;
        document.getElementById('ue-delete-name').textContent = `${nom}`;
        document.body.style.overflow = "hidden"

        const deleteButton = document.getElementById('confirm-delete-ue');
        deleteButton.onclick = () => this.deleteUE(code);
        this.overlay.classList.remove('hidden');
    }

    deleteUE(id) {
        fetch(`/admin/delete-ue/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const userCard = document.getElementById(`ue-${id}`);
                    if (userCard) {
                        userCard.remove();
                    }
                    this.editStat();
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




    editStat(){
        try{
            fetch('/admin/get-stat')
                .then(res => res.json())
                .then(data => {
                    //console.log(data)
                    data.forEach(dat => {
                        document.getElementById(dat.id_stat).innerHTML = dat.nombre;
                    });
                    //console.log("stat")
                })
        } catch (e){
            console.log(e)

        }

    }
}

/**
 * Affiche un message de succès
 * @param {string} message - Message à afficher
 */
function showSuccess(message) {
    // Implémenter selon votre UI
    const successToast = document.createElement('div');
    successToast.className = 'success-toast';
    successToast.textContent = message;
    document.body.appendChild(successToast);

    setTimeout(() => {
        successToast.remove();
    }, 3000);
}


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

                let cat = window.popupManager.popupCat

                let element = cat === 1 ? document.getElementById('prev-picture') : document.getElementById('prev-picture-ue');
                element.src = reader.result;
            };
        } else {
            thumbnailElement.style.backgroundImage = null;
        }
    }

}

function resetDropZone() {
    const dropZoneElements = document.querySelectorAll('.drop-zone');

    dropZoneElements.forEach(dropZoneElement => {
        const inputElement = dropZoneElement.querySelector('.drop-zone__input');

        // Réinitialise l'input file
        inputElement.value = '';

        // Supprime la miniature si elle existe
        const thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');
        if (thumbnailElement) {
            thumbnailElement.remove();
        }

        // Recrée les éléments initiaux s'ils ont été supprimés
        if (!dropZoneElement.querySelector('.drop-zone__prompt')) {
            const promptElement = document.createElement('div');
            promptElement.classList.add('drop-zone__prompt');
            promptElement.textContent = "Glissez-déposez un fichier ou cliquez pour sélectionner";

            const separator = document.createElement('div');
            separator.classList.add('separator');
            separator.textContent = "ou";

            const fakeButton = document.createElement('div');
            fakeButton.classList.add('fake-button');
            fakeButton.textContent = "Sélectionner un fichier";

            dropZoneElement.prepend(fakeButton);
            dropZoneElement.prepend(separator);
            dropZoneElement.prepend(promptElement);
        }

        let element, image;
        let cat = window.popupManager.popupCat;

        if (cat === 1) {
            element = document.getElementById('prev-picture')
            image = 'images/profil/default.jpg';
        } else {
            element = document.getElementById('prev-picture-ue');
            image = 'images/ue/default-ban.jpg'
        }


        if (element.src !== image) {
            element.src = image;
        }
    });
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

function changeCodeUE(code){
    let result = code;
    if(result === ""){
        result = "[Code]";
    }
    document.getElementById('prev-code-section').innerHTML = `<strong>${result}</strong>`;
}

function changeNomUE(nom){
    let result = nom;
    if(result === ""){
        result = "[Nom de l'UE]";
    }
    document.getElementById('prev-nomUe-section').innerHTML = `<strong>${result}</strong>`;
}

function resetAllMultiSelect() {

    // Réinitialiser les sélections d'UE
    resetUESelections();

    // Réinitialiser les prévisualisations
    resetPreviews();

}

function resetUESelections() {
    // Pour les deux types (ue et user)
    ['ue', 'user'].forEach(pref => {
        // Désélectionner toutes les options
        document.querySelectorAll(`#${pref}-options-list .option.selected`).forEach(option => {
            option.classList.remove('selected');
        });

        // Supprimer tous les tags
        const selectedContainer = document.getElementById(`${pref}-selected-options`);
        if (selectedContainer) {
            selectedContainer.innerHTML = '';
        }

        // Réinitialiser l'input caché
        const hiddenInput = document.getElementById(`${pref}-ue-input`);
        if (hiddenInput) {
            hiddenInput.value = '';
        }
    });
}

function resetFilters() {
    // Réinitialiser les champs de filtre
    const filterUE = document.getElementById('ue-option-filter');
    const filterUser = document.getElementById('user-option-filter');

    if (filterUE) filterUE.value = '';
    if (filterUser) filterUser.value = '';

    // Afficher à nouveau toutes les options
    document.querySelectorAll('.option.hidden').forEach(option => {
        option.classList.remove('hidden');
    });
}

function resetPreviews() {
    // Réinitialiser les prévisualisations d'UE
    const previewUE = document.getElementById('ue-prev-ue');
    const previewUser = document.getElementById('user-prev-ue');

    if (previewUE) previewUE.innerHTML = '';
    if (previewUser) previewUser.innerHTML = '';

    // Réinitialiser le prénom dans la prévisualisation
    changeFirstName('');
}


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('utilisateur_nom').addEventListener('keyup', (event) =>{
        changeLastName(event.target.value)
    })

    document.getElementById('utilisateur_prenom').addEventListener('keyup', (event) =>{
        changeFirstName(event.target.value)

    })

    document.getElementById('utilisateur_email').addEventListener('keyup', (event) =>{
        changeMail(event.target.value)

    })

    document.getElementById('ue_id').addEventListener('keyup', (event) => {
        changeCodeUE(event.target.value)
    })

    document.getElementById('ue_nom').addEventListener('keyup', (event) => {
        changeNomUE(event.target.value)
    })

    dropZoneLoaded()

    window.popupManager = new PopupManager();
})

