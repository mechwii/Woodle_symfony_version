<?php

namespace App\Controller;

use App\Entity\Notification;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class EtudiantController extends AbstractController
{
    #[Route('/etudiant', name: 'app_etudiant')]
    public function index(EntityManagerInterface $BDDManager, NotificationController $notificationController): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->redirectToRoute('app_login');
        }

        $connection = $BDDManager->getConnection();

        // Récupérer les UE
        $sqlUe = '
            SELECT ue.code, ue.nom, ue.image,
                   u.nom AS nom_responsable, u.prenom, est_affecte.favori
            FROM ue
            INNER JOIN est_affecte ON est_affecte.code_id = ue.code
            INNER JOIN utilisateur u ON u.id_utilisateur = est_affecte.utilisateur_id
            WHERE est_affecte.utilisateur_id = :user_id
        ';
        $ues = $connection->executeQuery($sqlUe, ['user_id' => $user->getId()])->fetchAllAssociative();

        // Récupérer les premières notifications
        $notificationsData = $notificationController->getNotificationsData($BDDManager, $user->getId(), 0, 4);

        return $this->render('choix_ue/choix_ue.html.twig', [
            'controller_name' => 'EtudiantController',
            'user' => $user,
            'ues' => $ues,
            'notifications' => $notificationsData['notifications'],
            'showMoreButton' => $notificationsData['hasMore'],
        ]);
    }


}
