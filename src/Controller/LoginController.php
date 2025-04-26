<?php

namespace App\Controller;

use App\Entity\UE;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class LoginController extends AbstractController
{
    #[Route(path: '/', name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // On s'assure que quelqu'un connecté ne peut pas retourner dasn cette page
        if ($this->getUser()) {
            // Récupérer les rôles
            $roles = $this->getUser()->getRoles();

            // Rediriger en fonction du rôle
            if (in_array('ROLE_ADMINISTRATEUR', $roles)) {
                return $this->redirectToRoute('app_admin');
            }

            if (in_array('ROLE_PROFESSEUR', $roles)) {
                return $this->redirectToRoute('app_professeur');
            }

            if (in_array('ROLE_ELEVE', $roles)) {
                return $this->redirectToRoute('app_etudiant');
            }

            // Redirection par défaut
            return $this->redirectToRoute('app_home');
        }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('login/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
        ]);
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    // Contrôleur
    #[Route('/get-stat', name: 'get-stat')]
    public function getResponsables(EntityManagerInterface $em): JsonResponse
    {
        $countUE = $em->getRepository(UE::class)->count();
        $countUser = $em->getRepository(Utilisateur::class)->count();

        $countProfesseur = $em->getRepository(Utilisateur::class)
            ->createQueryBuilder('u')
            ->select('COUNT(DISTINCT u.id)')
            ->join('u.roles', 'r', 'WITH', 'r.id = :roleId')
            ->setParameter('roleId', 2)
            ->getQuery()
            ->getSingleScalarResult();



        $countEleve = $em->getRepository(Utilisateur::class)
            ->createQueryBuilder('u')
            ->select('COUNT(DISTINCT u.id)')
            ->join('u.roles', 'r', 'WITH', 'r.id = :roleId')
            ->setParameter('roleId', 3)
            ->getQuery()
            ->getSingleScalarResult();


        $response = [
            'stat_users' =>$countUser,
            'stat_ues' => $countUE,
            'stat_professeurs' => $countProfesseur,
            'stat_eleves' => $countEleve,

        ];
        return $this->json($response);
    }


}
