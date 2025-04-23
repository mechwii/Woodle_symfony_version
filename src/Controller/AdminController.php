<?php

namespace App\Controller;

use App\Entity\EstAffecte;
use App\Entity\Role;
use App\Entity\UE;
use App\Form\UtilisateurType;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class AdminController extends AbstractController
{
    #[Route('/admin', name: 'app_admin')]
    public function index(EntityManagerInterface $BDDManager, Request $request): Response
    {
        /*$elmir = $BDDManager->getRepository(Utilisateur::class)->find(2);
        foreach ($elmir->getEstAffectes() as $estAffecte) {
            dump($BDDManager->getRepository(UE::class)->find($estAffecte->getCodeId())->getNom());
        }
        */
        $connection = $BDDManager->getConnection();

        // Récupération des UE avec Nom Responsable
        $sql = 'SELECT Ue.code, Ue.nom, Ue.description, Ue.semestre, Ue.image, u.nom as nom_responsable, u.prenom as prenom_responsable  FROM Ue INNER JOIN Utilisateur u ON u.id_utilisateur = UE.responsable_id';
        $prepareSQL = $connection->prepare($sql);
        $resultat = $prepareSQL->executeQuery();
        $ue = $resultat->fetchAllAssociative();

        $utilisateur = $this->getUser();
        $roles = $utilisateur->getRoles();


        $statistiques = [[
            "nom" => "Nombre d'élèves",
            "nombre" => 39,
            "icons" => "lni lni-user-multiple-4"
        ], [
            "nom" => "Nombre d'enseignants",
            "nombre" => 39,
            "icons" => "lni lni-coffee-cup-2"
        ], [
            "nom" => "Nombre d'UE",
            "nombre" => 39,
            "icons" => "lni lni-graduation-cap-1"
        ]];

        $allUtilisateur = $BDDManager->getRepository(Utilisateur::class)->findAll();
        $AllRoles = $BDDManager->getRepository(Role::class)->findAll();

        $nouvelUtilisateur = new Utilisateur();
        $form = $this->createForm(UtilisateurType::class, $nouvelUtilisateur);
        $form->handleRequest($request);

        return $this->render('admin/index.html.twig', [
            'form' => $form->createView(),
            'controller_name' => 'AdminController',
            'utilisateur' => $utilisateur,
            'roles' => $roles,
            "statistiques" => $statistiques,
            "allUtilisateur" => $allUtilisateur,
            "ue" => $ue,
            "allRoles" => $AllRoles,
        ]);
    }


    #[Route('/admin/profil', name: 'admin_profil')]
    public function profile(EntityManagerInterface $BDDManager): Response
    {
        $utilisateur = $BDDManager->getRepository(Utilisateur::class)->findOneBy(["email" => $this->getUser()->getUserIdentifier()]);
        $roles = $utilisateur->getRoles();
        return $this->render('admin/profil_admin.html.twig', [
            'controller_name' => 'AdminController',
            'utilisateur' => $utilisateur,
            'roles' => $roles
        ]);
    }

    #[Route('/admin/get-user/{id}', name: 'admin_get_user', methods: ['GET'])]
    public function getUtilisateur(int $id, EntityManagerInterface $BDDManager): JsonResponse
    {
        $connection = $BDDManager->getConnection();

        $user = $BDDManager->getRepository(Utilisateur::class)->find($id);

        $sql = 'SELECT u.code, u.nom
        FROM est_affecte
        INNER JOIN ue u on u.code = est_affecte.code_id
        WHERE est_affecte.utilisateur_id= :id;';
        $ue = $connection->prepare($sql)->executeQuery(['id' => $user->getId()])->fetchAllAssociative();

        $sql2 = 'SELECT r.id_role, r.nom
         from possede 
         INNER JOIN Role r on r.id_role = possede.role_id 
         WHERE possede.utilisateur_id = :id;';
        $roles = $connection->prepare($sql2)->executeQuery(['id' => $user->getId()])->fetchAllAssociative();


        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'nom' => $user->getNom(),
            'email' => $user->getEmail(),
            'telephone' => $user->getTelephone(),
            'prenom' => $user->getPrenom(),
            'image' => $user->getImage(),
            'roles' => $roles,
            'ue' => $ue
        ]);
    }

    /**
     * Ajoute un utilisateur avec Ajax et validation de formulaire
     */
    #[Route('/admin/add-user', name: 'admin_add_user', methods: ['POST'])]
    public function addUser(
        Request                $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface     $validator
    ): Response
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->json(['error' => 'Requête non autorisée'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Récupération des données du formulaire
            $data = $request->toArray();

            if (!$data) {
                return $this->json(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }

            // Création d'un nouvel utilisateur
            $utilisateur = new Utilisateur();

            // Création d'un formulaire sans le lier à une requête (car on utilise JSON)
            $form = $this->createForm(UtilisateurType::class, $utilisateur);

            // Soumission manuelle des données au formulaire
            $form->submit([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'telephone' => $data['telephone'] ?? null,
            ]);

            // Validation du formulaire
            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json(['error' => 'Erreurs de validation', 'details' => $errors], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si l'email existe déjà
            $existingUser = $entityManager->getRepository(Utilisateur::class)->findOneBy(['email' => $data['email']]);
            if ($existingUser) {
                return $this->json(['error' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
            }

            // Générer un mot de passe par défaut
            $defaultPassword = strtolower(substr($data['prenom'], 0, 1) . $data['nom'] . '@123');
            $utilisateur->setPassword($defaultPassword);


            // Image de profil
            $imageName = $data['image'] ?? 'default.jpg';
            $utilisateur->setImage($imageName);

            // Ajouter les rôles
            if (!empty($data['roles'])) {
                foreach ($data['roles'] as $roleId) {
                    $role = $entityManager->getRepository(Role::class)->find($roleId);
                    if ($role) {
                        $utilisateur->addRole($role);
                    }
                }
            } else {
                return $this->json(['error' => 'Veuillez sélectionner au moins un rôle'], Response::HTTP_BAD_REQUEST);
            }


            // Persister l'utilisateur
            $entityManager->persist($utilisateur);
            $entityManager->flush();

            // Ajouter les UE sélectionnées
            if (!empty($data['ues'])) {
                foreach ($data['ues'] as $ueCode) {
                    $ue = $entityManager->getRepository(UE::class)->find($ueCode);
                    if ($ue) {
                        $estAffecte = new EstAffecte();
                        $estAffecte->setUtilisateurId($utilisateur);
                        $estAffecte->setCodeId($ue);
                        $estAffecte->setFavori(false);
                        $entityManager->persist($estAffecte);

                    }
                }
                $entityManager->flush();
            }

            return $this->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'user' => [
                    'id' => $utilisateur->getId(),
                    'nom' => $utilisateur->getNom(),
                    'prenom' => $utilisateur->getPrenom(),
                    'email' => $utilisateur->getEmail(),
                    'image' => $utilisateur->getImage(),
                    'roles' => $utilisateur->getRoles()
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/admin/delete-user/{id}', name: 'admin_delete_user', methods: ['DELETE'])]
    public function deleteUser(int $id, EntityManagerInterface $BDDManager): Response
    {
        $utilisateur = $BDDManager->getRepository(Utilisateur::class)->find($id);

        if (!$utilisateur) {
            return $this->json(['success' => false, 'message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($utilisateur && $utilisateur->getImage() !== 'default.jpg') {
            $oldImagePath = $this->getParameter('kernel.project_dir') . '/public/images/profil/' . $utilisateur->getImage();

            if (file_exists($oldImagePath)) {
                unlink($oldImagePath);
            }
        }

        $BDDManager->remove($utilisateur);
        $BDDManager->flush();
        return $this->json(['success' => true], Response::HTTP_OK);
    }

    /**
     * Modifie un utilisateur existant avec Ajax et validation de formulaire
     */
    #[Route('/admin/edit-user/{id}', name: 'admin_edit_user', methods: ['PUT'])]
    public function editUser(
        Request                $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface     $validator,
        int                    $id
    ): Response
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->json(['error' => 'Requête non autorisée'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Récupération des données du formulaire
            $data = $request->toArray();

            if (!$data) {
                return $this->json(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }

            // Récupération de l'utilisateur existant
            $utilisateur = $entityManager->getRepository(Utilisateur::class)->find($id);

            if (!$utilisateur) {
                return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
            }

            // Récupérer les IDs des rôles actuels pour comparaison
            $originalRoleIds = [];
            foreach ($utilisateur->getRoleObjects() as $role) {
                $originalRoleIds[] = $role->getId();
            }

            // Les rôles du formulaire sont des IDs (nombres)
            $dataRoles = $data['roles'] ?? [];

            // Comparaison correcte
            $rolesModified = count(array_diff($dataRoles, $originalRoleIds)) > 0 ||
                count(array_diff($originalRoleIds, $dataRoles)) > 0;


            if ($rolesModified) {
                // Supprimer tous les rôles actuels
                foreach ($utilisateur->getRoleObjects()->toArray() as $role) {
                    $utilisateur->removeRole($role);
                }

                // Ajouter les nouveaux rôles
                foreach ($dataRoles as $roleId) {
                    $role = $entityManager->getRepository(Role::class)->find($roleId);
                    if ($role) {
                        $utilisateur->addRole($role);
                    }
                }
            }

            // Récupérer les codes des UEs actuelles
            $originalUECodes = [];
            foreach ($utilisateur->getEstAffectes() as $estAffecte) {
                if ($estAffecte->getCodeId()) {
                    $originalUECodes[] = $estAffecte->getCodeId()->getId();
                }
            }

            // Les UEs du formulaire sont des codes (chaînes)
            $dataUEs = $data['ues'] ?? [];

            // Trouver les UEs à supprimer (celles qui sont dans originalUECodes mais pas dans dataUEs)
            $uesToRemove = array_diff($originalUECodes, $dataUEs);

            // Trouver les UEs à ajouter (celles qui sont dans dataUEs mais pas dans originalUECodes)
            $uesToAdd = array_diff($dataUEs, $originalUECodes);

            // Si des modifications sont nécessaires
            if (!empty($uesToRemove) || !empty($uesToAdd)) {
                // Supprimer uniquement les affectations qui ne sont plus dans la liste
                if (!empty($uesToRemove)) {
                    foreach ($utilisateur->getEstAffectes() as $estAffecte) {
                        $ueCode = $estAffecte->getCodeId()->getId();
                        if (in_array($ueCode, $uesToRemove)) {
                            $entityManager->remove($estAffecte);
                        }
                    }
                }

                // Ajouter uniquement les nouvelles affectations
                if (!empty($uesToAdd)) {
                    foreach ($uesToAdd as $ueCode) {
                        $ue = $entityManager->getRepository(UE::class)->find($ueCode);
                        if ($ue) {
                            $estAffecte = new EstAffecte();
                            $estAffecte->setUtilisateurId($utilisateur);
                            $estAffecte->setCodeId($ue);
                            $estAffecte->setFavori(false);
                            $entityManager->persist($estAffecte);
                        }
                    }
                }

                // Assurez-vous que les changements sont bien sauvegardés
                $entityManager->flush();
            }


            // Sauvegarde des valeurs originales pour comparaison

            $originalEmail = $utilisateur->getEmail();
            $originalNom = $utilisateur->getNom();
            $originalPrenom = $utilisateur->getPrenom();
            $originalTelephone = $utilisateur->getTelephone();
            $originalImage = $utilisateur->getImage();

            // Création d'un formulaire sans le lier à une requête (car on utilise JSON)
            $form = $this->createForm(UtilisateurType::class, $utilisateur);

            // Soumission manuelle des données au formulaire
            $form->submit([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'telephone' => $data['telephone'] ?? null,
            ]);

            // Validation du formulaire
            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json(['error' => 'Erreurs de validation', 'details' => $errors], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si l'email existe déjà (si l'email a été modifié)
            if ($originalEmail !== $data['email']) {
                $existingUser = $entityManager->getRepository(Utilisateur::class)->findOneBy(['email' => $data['email']]);
                if ($existingUser && $existingUser->getId() !== $id) {
                    return $this->json(['error' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
                }
            }

            // Mettre à jour l'image de profil si elle a été modifiée
            $imageName = $data['image'] ?? $originalImage;
            if ($imageName !== $originalImage && $data['image'] !== "") {
                $utilisateur->setImage($imageName);
            }


            // Vérifier si des modifications ont été effectuées
            $informationsModifiees =
                $originalNom !== $data['nom'] ||
                $originalPrenom !== $data['prenom'] ||
                $originalEmail !== $data['email'] ||
                $originalTelephone !== ($data['telephone'] ?? null) ||
                $originalImage !== $imageName ||
                $originalRoleIds !== $data['roles'];

            // Persister les modifications uniquement si nécessaire
            if ($informationsModifiees) {
                $entityManager->flush();
                return $this->json([
                    'success' => true,
                    'message' => 'Utilisateur modifié avec succès',
                    'user' => [
                        'id' => $utilisateur->getId(),
                        'nom' => $utilisateur->getNom(),
                        'prenom' => $utilisateur->getPrenom(),
                        'email' => $utilisateur->getEmail(),
                        'image' => $utilisateur->getImage(),
                        'roles' => $utilisateur->getRoles(),
                    ]
                ], Response::HTTP_OK);
            } else {
                return $this->json([
                    'success' => true,
                    'message' => 'Aucune modification détectée',
                    'user' => [
                        'id' => $utilisateur->getId(),
                        'nom' => $utilisateur->getNom(),
                        'prenom' => $utilisateur->getPrenom(),
                        'email' => $utilisateur->getEmail(),
                        'image' => $utilisateur->getImage(),
                        'roles' => $utilisateur->getRoles()
                    ]
                ], Response::HTTP_OK);
            }

        } catch
        (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Upload d'image pour un utilisateur
     */
    #[Route('/admin/upload-image', name: 'admin_upload_image', methods: ['POST'])]
    public function uploadImage(Request $request, EntityManagerInterface $em): Response
    {
        try {
            $uploadedFile = $request->files->get('file');
            $userId = $request->request->get('id_user');

            $realName = $uploadedFile->getClientOriginalName();
            $extension = $uploadedFile->getClientOriginalExtension();

            if ($userId) {
                $user = $em->getRepository(Utilisateur::class)->find($userId);

                if ($user && $user->getImage() !== 'default.jpg' && $user->getImage() !== $realName) {
                    $oldImagePath = $this->getParameter('kernel.project_dir') . '/public/images/profil/' . $user->getImage();

                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
            }
            $uploadedFile->move($this->getParameter('kernel.project_dir') . '/public/images/profil', $realName);


            return $this->json([
                'success' => true,
                'image' => $realName,
                'extension' => $extension,
            ], Response::HTTP_OK);


        } catch (\Exception $e) {
            return $this->json(['success' => false], Response::HTTP_NOT_FOUND);
        }
    }
}
