<?php

namespace App\Controller;
use App\Entity\Priorite;

use App\Entity\EstAffecte;
use App\Entity\TypeNotification;
use App\Entity\Notification;
use App\Entity\Role;
use App\Entity\UE;
use App\Form\UeType;
use App\Form\UserProfileType;
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
        $sql = 'SELECT Ue.code, Ue.nom, Ue.image, u.nom as nom_responsable, u.prenom as prenom_responsable  FROM Ue INNER JOIN Utilisateur u ON u.id_utilisateur = UE.responsable_id';
        $prepareSQL = $connection->prepare($sql);
        $resultat = $prepareSQL->executeQuery();
        $ue = $resultat->fetchAllAssociative();

        $utilisateur = $this->getUser();
        $roles = $utilisateur->getRoles();

        $statistiques = $this->getStatisticsData($BDDManager);

        $allUtilisateur = $BDDManager->getRepository(Utilisateur::class)->findAll();
        $AllRoles = $BDDManager->getRepository(Role::class)->findAll();

        $nouvelUtilisateur = new Utilisateur();
        $form = $this->createForm(UtilisateurType::class, $nouvelUtilisateur);
        $form->handleRequest($request);

        $newUe = new UE();
        $form2 = $this->createForm(UEType::class, $newUe);
        $form2->handleRequest($request);

        return $this->render('admin/index.html.twig', [
            'form' => $form->createView(),
            'form2' => $form2->createView(),
            'controller_name' => 'AdminController',
            'utilisateur' => $utilisateur,
            'roles' => $roles,
            "statistiques" => $statistiques,
            "allUtilisateur" => $allUtilisateur,
            "ue" => $ue,
            "allRoles" => $AllRoles,
        ]);
    }

    #[Route('/admin/get-stat', name: 'get_admin_stat')]
    public function getStat(EntityManagerInterface $BDDManager): JsonResponse
    {
        // Return JSON response using the same private method
        return new JsonResponse($this->getStatisticsData($BDDManager));
    }

    /**
     * Private method that contains the actual statistics logic
     */
    private function getStatisticsData(EntityManagerInterface $BDDManager): array
    {
        return [
            [
                "id_stat" => "nb_eleve",
                "nom" => "Nombre d'élèves",
                "nombre" => $BDDManager->getRepository(Utilisateur::class)
                    ->createQueryBuilder('u')
                    ->select('COUNT(DISTINCT u.id)')
                    ->join('u.roles', 'r', 'WITH', 'r.id = :roleId')
                    ->setParameter('roleId', 3)
                    ->getQuery()
                    ->getSingleScalarResult(),
                "icons" => "lni lni-user-multiple-4"
            ],
            [
                "id_stat" => "nb_enseignant",
                "nom" => "Nombre d'enseignants",
                "nombre" => $BDDManager->getRepository(Utilisateur::class)
                    ->createQueryBuilder('u')
                    ->select('COUNT(DISTINCT u.id)')
                    ->join('u.roles', 'r', 'WITH', 'r.id = :roleId')
                    ->setParameter('roleId', 2)
                    ->getQuery()
                    ->getSingleScalarResult(),
                "icons" => "lni lni-coffee-cup-2"
            ],
            [
                "id_stat" => "nb_ue",
                "nom" => "Nombre d'UE",
                "nombre" => $BDDManager->getRepository(UE::class)->count([]),
                "icons" => "lni lni-graduation-cap-1"
            ]
        ];
    }
    #[Route('/admin/profil', name: 'admin_profil')]
    public function profile(EntityManagerInterface $BDDManager, Request $request): Response
    {
        $utilisateur = $BDDManager->getRepository(Utilisateur::class)->findOneBy(["email" => $this->getUser()->getUserIdentifier()]);
        $roles = $utilisateur->getRoles();

        $nouvelUtilisateur = new Utilisateur();
        $form = $this->createForm(UserProfileType::class, $nouvelUtilisateur);
        $form->handleRequest($request);


        return $this->render('admin/profil_admin.html.twig', [
            'controller_name' => 'AdminController',
            'utilisateur' => $utilisateur,
            'roles' => $roles,
            'form' => $form->createView(),
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
            'prenom' => $user->getPrenom(),
            'image' => $user->getImage(),
            'password' => $user->getPassword(),
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
                'password' => $data['password']
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

            // Générer un mot de passe par défaut password
            if($data['password'] === ""){
                $defaultPassword = strtolower(substr($data['prenom'], 0, 1) . $data['nom'] . '@123');
                $utilisateur->setPassword($defaultPassword);
            } else {
                $utilisateur->setPassword($data['password']);
            }

            // Image de profil
            $imageName = $data['image'];
            // $imageName = $data['image'] ?? 'default.jpg';
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

                        $this->createAffectationNotification($entityManager, $utilisateur, $ue, $this->getUser());
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

                            $this->createAffectationNotification($entityManager, $utilisateur, $ue, $this->getUser());

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
            $originalImage = $utilisateur->getImage();
            $originalPassword = $utilisateur->getPassword();

            // Création d'un formulaire sans le lier à une requête (car on utilise JSON)
            $form = $this->createForm(UtilisateurType::class, $utilisateur);

            // Soumission manuelle des données au formulaire
            $form->submit([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'password' => $data['password'],
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
            $imageName = $data['image'];
            if ($imageName !== $originalImage && $data['image'] !== "") {
                $utilisateur->setImage($imageName);
            }


            // Vérifier si des modifications ont été effectuées
            $informationsModifiees =
                $originalNom !== $data['nom'] ||
                $originalPrenom !== $data['prenom'] ||
                $originalEmail !== $data['email'] ||
                $originalImage !== $imageName ||
                $originalPassword !== $data['password'] ||
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
     * Ajoute une UE avec Ajax et validation de formulaire
     */
    #[Route('/admin/add-ue', name: 'admin_add_ue', methods: ['POST'])]
    public function addUE(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
    ): Response
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->json(['error' => 'Requête non autorisée'], Response::HTTP_BAD_REQUEST);
        }

        try{
            $data = $request->toArray();

            if (!$data) {
                return $this->json(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }

            $ue = new UE();

            $id = $data['id'];
            $nom = $data['nom'];
            $responsable_id = $data['responsable_id'];
            $image = $data['image'];
            $utilisateurs = $data['utilisateurs'];


            $form = $this->createForm(UeType::class, $ue);

            $form->submit([
                'id' => $data['id'],
                'nom' => $data['nom'],
            ]);

            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json(['error' => 'Erreurs de validation', 'details' => $errors], Response::HTTP_BAD_REQUEST);
            }

            $existingUE = $entityManager->getRepository(UE::class)->find($id);

            if ($existingUE) {
                return $this->json(['error' => 'Cette UE existe déjà'], Response::HTTP_CONFLICT);
            }

            $ue->setId($id);
            $ue->setNom($nom);
            $ue->setImage($image);
            $responsable = $entityManager->getRepository(Utilisateur::class)->find($responsable_id);
            $ue->setResponsableId($responsable);
            $entityManager->persist($ue);

            if (!empty($utilisateurs)) {
                foreach ($utilisateurs as $utilisateurId) {
                    $utilisateur = $entityManager->getRepository(Utilisateur::class)->find($utilisateurId);
                    if ($utilisateur) {
                        $estAffecte = new EstAffecte();
                        $estAffecte->setUtilisateurId($utilisateur);
                        $estAffecte->setCodeId($ue);
                        $estAffecte->setFavori(false);
                        $estAffecte->setDateInscription(new \DateTime());
                        $entityManager->persist($estAffecte);

                        $this->createAffectationNotification($entityManager, $utilisateur, $ue, $this->getUser());

                    }
                }
            }

            $entityManager->flush();


            // Préparation de la réponse
            $responseData = [
                'success' => true,
                'message' => 'UE créée avec succès',
                'ue' => [
                    'id' => $ue->getId(),
                    'nom' => $ue->getNom(),
                    'image' => $ue->getImage(),
                    'responsable' => $ue->getResponsableId(),
                    'responsable_nom' => $ue->getResponsableId()->getNom(),
                    'responsable_prenom' => $ue->getResponsableId()->getPrenom(),
                ]
            ];
            return $this->json($responseData, Response::HTTP_CREATED);

        } catch (\Exception $e){
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
            $dest = $request->request->get('dest');
            $code = $request->request->get('code');

            $realName = $uploadedFile->getClientOriginalName();
            $extension = $uploadedFile->getClientOriginalExtension();

            if ($userId) {
                $user = $em->getRepository(Utilisateur::class)->find($userId);

                if ($user && $user->getImage() !== 'default.jpg' && $user->getImage() !== $realName  && $user->getImage() !== "") {
                    $oldImagePath = $this->getParameter('kernel.project_dir') . $dest . $user->getImage();

                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
            }

            if($code){
                $ue = $em->getRepository(UE::class)->find($code);

                if($ue && $ue->getImage() !== $realName && $ue->getImage() !=='default-ban.jpg' && $ue->getImage() !== "") {
                    $oldImagePath = $this->getParameter('kernel.project_dir') . $dest . $ue->getImage();

                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

            }


            // $defaultPassword = strtolower(substr($prenom, 0, 1) . $nom . '_picture' .  '.' . $extension);
            $uploadedFile->move($this->getParameter('kernel.project_dir') . $dest , $realName);


            return $this->json([
                'success' => true,
                'image' => $realName,
                'extension' => $extension,
            ], Response::HTTP_OK);


        } catch (\Exception $e) {
            return $this->json(['success' => false], Response::HTTP_NOT_FOUND);
        }
    }

    // Contrôleur
    #[Route('/admin/get-responsables', name: 'admin_get_responsables')]
    public function getResponsables(EntityManagerInterface $em): JsonResponse
    {
        $responsables = $em->getRepository(Utilisateur::class)
            ->createQueryBuilder('u')
            ->join('u.roles', 'r')
            ->where('r.id = :id')
            ->setParameter('id', 2)
            ->getQuery()
            ->getResult();

        // On renvoie les utilisateurs sous forme d'un tableau JSON avec id et nom
        $response = [];
        foreach ($responsables as $responsable) {
            $response[] = [
                'id' => $responsable->getId(),
                'name' => $responsable->getNom() . ' ' . $responsable->getPrenom(),
            ];
        }

        return new JsonResponse($response);
    }

    #[Route('/admin/get-utilisateurs-affectable', name: 'admin_get_utilisateurs-affectable')]
    public function getUtilisateurAffectable(EntityManagerInterface $em): JsonResponse
    {
        $utilisateurs = $em->getRepository(Utilisateur::class)
            ->createQueryBuilder('u')
            ->join('u.roles', 'r')
            ->where('r.id = :id OR r.id = :id2')
            ->setParameter('id', 2, )
            ->setParameter('id2', 3, )
            ->getQuery()
            ->getResult();

        $response = [];
        foreach ($utilisateurs as $utilisateur) {
            $response[] = [
                'id' => $utilisateur->getId(),
                'nom' => $utilisateur->getNom() . ' ' . $utilisateur->getPrenom(),
            ];
        }

        return new JsonResponse($response);
    }

    #[Route('/admin/get-ue', name: 'admin_get_ue', methods: ['GET'])]
    public function getUe(EntityManagerInterface $em): JsonResponse
    {
        $ues = $em->getRepository(UE::class)->findAll();

        $response = [];

        foreach ($ues as $ue) {
            $response[] = [
                'code' => $ue->getId(),
                'nom' => $ue->getNom()
            ];
        }

        return new JsonResponse($response);
    }

    #[Route('/admin/get-one-ue/{id}', name: 'admin_get_one_ue', methods: ['GET'])]
    public function getUeById(EntityManagerInterface $repo, string $id): JsonResponse
    {
        $connection = $repo->getConnection();

        $ue = $repo->getRepository(UE::class)->find($id);

        $sql = 'SELECT u.id_utilisateur as id , u.nom as nom, u.prenom as prenom
                FROM Est_affecte e
                INNER JOIN Utilisateur u ON u.id_utilisateur = e.utilisateur_id
                WHERE code_id= :id;';

        $affectations = $connection->prepare($sql)->executeQuery(['id' => $id])->fetchAllAssociative();

        $response = [
            'code' => $ue->getId(),
            'nom' => $ue->getNom(),
            'responsable_id' => $ue->getResponsableId()?->getId(),
            'responsable_nom' => $ue->getResponsableId()?->getNom() . ' ' . $ue->getResponsableId()?->getPrenom(),
            'image' => $ue->getImage(),
            'utilisateurs_affectes' => $affectations,
        ];

        return $this->json(['error' => false, 'ue' => $response], Response::HTTP_OK);
    }

    /**
     * Modifie un utilisateur existant avec Ajax et validation de formulaire
     */
    #[Route('/admin/edit-ue/{id}', name: 'admin_edit_ue', methods: ['PUT'])]
    public function editUE(
        Request                $request,
        EntityManagerInterface $entityManager,
        string                    $id
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
            $ue = $entityManager->getRepository(UE::class)->find($id);

            if (!$ue) {
                return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
            }

            $dataUEs = $data['utilisateurs'] ?? [];



            $originalUser = false;

            // Récupérer les codes des UEs actuelles
            $originalUECodes = [];
            foreach ($ue->getEstAffectes() as $estAffecte) {
                if ($estAffecte->getUtilisateurId()->getId()) {
                    $originalUECodes[] = $estAffecte->getUtilisateurId()->getId();
                }
            }
            



            if($dataUEs) {
                $uesToRemove = array_diff($originalUECodes, $dataUEs);
                // Dans le cas ou j'envoie un tableau vide il faut quand même supprimer toutes les UE
                if (empty($dataUEs) && !empty($originalUECodes)) {
                    $uesToRemove = $originalUECodes;
                }


                $uesToAdd = array_diff($dataUEs, $originalUECodes);
                if (!empty($uesToRemove) || !empty($uesToAdd)) {
                    $originalUser = true;
                    if (!empty($uesToRemove)) {
                        foreach ($ue->getEstAffectes() as $estAffecte) {
                            $idUtilisateur = $estAffecte->getUtilisateurId()->getId();
                            if (in_array($idUtilisateur, $uesToRemove)) {
                                $entityManager->remove($estAffecte);
                            }
                        }
                    }
                    if (!empty($uesToAdd)) {
                        foreach ($uesToAdd as $idUtilisateur) {
                            $utilisateur = $entityManager->getRepository(Utilisateur::class)->find($idUtilisateur);
                            if ($ue) {
                                $estAffecte = new EstAffecte();
                                $estAffecte->setUtilisateurId($utilisateur);
                                $estAffecte->setCodeId($ue);
                                $estAffecte->setFavori(false);
                                $entityManager->persist($estAffecte);

                                $this->createAffectationNotification($entityManager, $utilisateur, $ue, $this->getUser());

                            }
                        }
                    }
                    $entityManager->flush();
                }

            }

            $originalCode = $ue->getId();
            $originalNom = $ue->getNom();
            $orginalResponsable = $ue->getResponsableId()->getId();
            $originalImage = $ue->getImage();



             // Création d'un formulaire sans le lier à une requête (car on utilise JSON)
             $form = $this->createForm(UeType::class, $ue);

             // Soumission manuelle des données au formulaire
             $form->submit([
                 'id' => $data['id'],
                 'nom' => $data['nom']
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
            if ($originalCode !== $data['id']) {
                $existingUE = $entityManager->getRepository(UE::class)->find($data['id']);
                if ($existingUE && $existingUE->getId() !== $id) {
                    return $this->json(['error' => 'Ce code UE est déjà utilisé'], Response::HTTP_CONFLICT);
                } else {
                    $ue->setId($data['id']);
                }
            }

            // Mettre à jour l'image de profil si elle a été modifiée
            $imageName = $data['image'];
            // $imageName = $data['image'] ?? 'default-ban.jpg';

            if ($imageName !== $originalImage && $imageName !== "") {
                $ue->setImage($imageName);
            }

            if ($originalNom !== $data['nom']) {
                $ue->setNom($data['nom']);
            }
            if ($orginalResponsable !== $data['responsable_id']) {
                $responsable = $entityManager->getRepository(Utilisateur::class)->find($data['responsable_id']);
                $ue->setResponsableId($responsable);
            }


            // Vérifier si des modifications ont été effectuées
            $informationsModifiees =
                $originalCode !== $data['id'] ||
                $originalNom !== $data['nom'] ||
                $orginalResponsable !== $data['responsable_id'] ||
                $originalUser;


            // Persister les modifications uniquement si nécessaire
            if ($informationsModifiees) {
                $entityManager->flush();
                return $this->json([
                    'success' => true,
                    'message' => 'Utilisateur modifié avec succès',
                    'ue' => [
                        'id' => $ue->getId(),
                        'nom' => $ue->getNom(),
                        'image' => $ue->getImage(),
                        'responsable' => $ue->getResponsableId(),
                        'responsable_nom' => $ue->getResponsableId()->getNom(),
                        'responsable_prenom' => $ue->getResponsableId()->getPrenom(),
                    ]
                ], Response::HTTP_OK);
            } else {
                return $this->json([
                    'success' => true,
                    'message' => 'Aucune modification détectée',
                    'ue' => [
                        'id' => $ue->getId(),
                        'nom' => $ue->getNom(),
                        'image' => $ue->getImage(),
                        'responsable' => $ue->getResponsableId(),
                        'responsable_nom' => $ue->getResponsableId()->getNom(),
                        'responsable_prenom' => $ue->getResponsableId()->getPrenom(),
                    ]
                ], Response::HTTP_OK);
            }
        } catch
        (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/admin/delete-ue/{code}', name: 'admin_delete_ue', methods: ['DELETE'])]
    public function deleteUE(string $code, EntityManagerInterface $BDDManager): Response
    {
        $ue = $BDDManager->getRepository(UE::class)->find($code);

        if (!$ue) {
            return $this->json(['success' => false, 'message' => 'UE introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($ue && $ue->getImage() !== 'default-ban.jpg') {
            $oldImagePath = $this->getParameter('kernel.project_dir') . '/public/images/ue/' . $ue->getImage();

            if (file_exists($oldImagePath)) {
                unlink($oldImagePath);
            }
        }

        $BDDManager->remove($ue);
        $BDDManager->flush();
        return $this->json(['success' => true], Response::HTTP_OK);
    }

    /**
     * Modifie un utilisateur existant avec Ajax et validation de formulaire
     */
    #[Route('/admin/edit-profil/{id}', name: 'admin_edit_profil', methods: ['PUT'])]
    public function editProfil(
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

            $originalNom = $utilisateur->getNom();
            $originalPrenom = $utilisateur->getPrenom();
            $originalPassword = $utilisateur->getPassword();

            $form = $this->createForm(UserProfileType::class, $utilisateur);

            $form->submit([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'password' => $data['password'],
            ]);

            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json(['error' => 'Erreurs de validation', 'details' => $errors], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si des modifications ont été effectuées
            $informationsModifiees =
                $originalNom !== $data['nom'] ||
                $originalPrenom !== $data['prenom'] ||
                $originalPassword !== $data['password'];

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
                        'password' => $utilisateur->getPassword(),
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
                        'password' => $utilisateur->getPassword(),
                    ]
                ], Response::HTTP_OK);
            }

        } catch
        (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Crée une notification lorsqu'un utilisateur est affecté à une UE
     */
    private function createAffectationNotification(
        EntityManagerInterface $entityManager,
        Utilisateur $utilisateur,
        UE $ue,
        Utilisateur $expediteur
    ): void {
        $notification = new Notification();

        $notification->setContenu("Vous avez été affecté(e) à l'UE: " . $ue->getNom());

        $roles = $utilisateur->getRoles();

        if(in_array('ROLE_PROFESSEUR', $roles)) {
            $notification->setUrlDestination('professeur/contenu_ue-' . $ue->getId());
        }else if(in_array('ROLE_ELEVE', $roles)){
            $notification->setUrlDestination('etudiant/contenu_ue-' . $ue->getId());
        }

        $typeNotification = $entityManager->getRepository(TypeNotification::class)->findOneBy(['id' => 1]);
        if ($typeNotification) {
            $notification->setTypeNotificationId($typeNotification);
        }

        $notification->setUtilisateurExpediteurId($expediteur ?? $this->getUser());

        $notification->setUtilisateurDestinataireId($utilisateur);

        $notification->setCodeId($ue);

        $priorite = $entityManager->getRepository(Priorite::class)->findOneBy(['id' => 1]);
        if ($priorite) {
            $notification->setPrioriteId($priorite);
        }

        $entityManager->persist($notification);
        $entityManager->flush();
    }
}
