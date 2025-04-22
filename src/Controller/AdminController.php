<?php

namespace App\Controller;

use App\Entity\Role;
use App\Entity\UE;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AdminController extends AbstractController
{
    #[Route('/admin', name: 'app_admin')]
    public function index(EntityManagerInterface $BDDManager): Response
    {
        /*$elmir = $BDDManager->getRepository(Utilisateur::class)->find(2);
        foreach ($elmir->getEstAffectes() as $estAffecte) {
            dump($BDDManager->getRepository(UE::class)->find($estAffecte->getCodeId())->getNom());
        }
        */
        $connection = $BDDManager->getConnection();

        // Récupération des UE avec Nom Responsable
        $sql ='SELECT Ue.code, Ue.nom, Ue.description, Ue.semestre, Ue.image, u.nom as nom_responsable, u.prenom as prenom_responsable  FROM Ue INNER JOIN Utilisateur u ON u.id_utilisateur = UE.responsable_id';
        $prepareSQL = $connection->prepare($sql);
        $resultat = $prepareSQL->executeQuery();
        $ue = $resultat->fetchAllAssociative();

        $utilisateur = $this->getUser();
        $roles = $utilisateur->getRoles();
        $statistiques = [[
            "nom"   => "Nombre d'élèves",
            "nombre" => 39,
            "icons" => "lni lni-user-multiple-4"
        ],[
            "nom"   => "Nombre d'enseignants",
            "nombre" => 39,
            "icons" => "lni lni-coffee-cup-2"
        ],[
            "nom"   => "Nombre d'UE",
            "nombre" => 39,
            "icons" => "lni lni-graduation-cap-1"
        ]];

        $allUtilisateur = $BDDManager->getRepository(Utilisateur::class)->findAll();
        $AllRoles = $BDDManager->getRepository(Role::class)->findAll();


        return $this->render('admin/index.html.twig', [
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
        $utilisateur = $BDDManager->getRepository(Utilisateur::class)->findOneBy(["email"=>$this->getUser()->getUserIdentifier()]);
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
        $user = $BDDManager->getRepository(Utilisateur::class)->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'image' => $user->getImage(),
        ]);
    }

    #[Route('/admin/delete-user/{id}', name: 'admin_delete_user', methods: ['DELETE'])]
    public function deleteUser(int $id, EntityManagerInterface $BDDManager): Response
    {
        $utilisateur = $BDDManager->getRepository(Utilisateur::class)->find($id);

        if(!$utilisateur){
            return $this->json(['success' => false, 'message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        $BDDManager->remove($utilisateur);
        $BDDManager->flush();
        return $this->json(['success' => true], Response::HTTP_OK);
    }
}
