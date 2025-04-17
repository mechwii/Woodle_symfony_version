<?php

namespace App\Controller;

use App\Entity\UE;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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

        $ue= $BDDManager->getRepository(UE::class)->findAll();
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

        // Certains utilisateurs ont plusieurs rôles et plusieurs UE donc il faut ajouter ça à chaque enregistrement
        $AllUtilisateurWithRole= [];

        $connection = $BDDManager->getConnection();
        $sql ='SELECT u.code, u.nom FROM Est_Affecte ea INNER JOIN UE u ON u.code = ea.code_id WHERE ea.utilisateur_id = :id;';
        foreach ($allUtilisateur as $user) {

            $stmt = $connection->prepare($sql);
            $result = $stmt->executeQuery(['id' => $user->getId()]);
            $ues = $result->fetchAllAssociative();

            $AllUtilisateurWithRole[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'motDePasse' => $user->getPassword(),
                'image' => $user->getImage(),
                'UE' => $ues
            ];
        }
        return $this->render('admin/index.html.twig', [
            'controller_name' => 'AdminController',
            'utilisateur' => $utilisateur,
            'roles' => $roles,
            "statistiques" => $statistiques,
            "allUtilisateur" => $allUtilisateur,
            "ue" => $ue,
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
}
