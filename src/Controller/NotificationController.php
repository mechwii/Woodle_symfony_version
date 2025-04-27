<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\Priorite;
use App\Entity\TypeNotification;
use App\Entity\UE;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class NotificationController extends AbstractController
{
    #[Route('/notifications', name: 'notifications_index')]
    public function getNotifications(EntityManagerInterface $BDDManager, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non connecté'], 401);
        }

        $offset = $request->query->getInt('offset', 0);
        $limit = 4;

        $notificationsData = $this->getNotificationsData($BDDManager, $user->getId(), $offset, $limit);

        return new JsonResponse([
            'notifications' => $notificationsData['notifications'],
            'showMoreButton' => $notificationsData['hasMore'],
        ]);
    }

    public function getNotificationsData(EntityManagerInterface $BDDManager, int $userId, int $offset, int $limit): array
    {
        $connection = $BDDManager->getConnection();

        $sql = '
            SELECT n.id_notification, n.url_destination, n.contenu, n.date_notif, n.type_notification_id, n.code_id, n.priorite_id, u.nom
            FROM Notification n
            INNER JOIN Utilisateur u ON u.id_utilisateur = n.utilisateur_expediteur_id
            WHERE n.utilisateur_destinataire_id = :utilisateur_id
            ORDER BY n.priorite_id DESC, n.date_notif DESC
            LIMIT :limit OFFSET :offset
        ';

        $stmt = $connection->prepare($sql);
        $notifications = $stmt->executeQuery([
            'utilisateur_id' => $userId,
            'limit' => $limit,
            'offset' => $offset,
        ])->fetchAllAssociative();

        $countSql = 'SELECT COUNT(n.id_notification) as total FROM Notification n WHERE n.utilisateur_destinataire_id = :utilisateur_id';
        $total = $connection->executeQuery($countSql, ['utilisateur_id' => $userId])->fetchAssociative()['total'];

        $hasMore = ($offset + $limit) < $total;

        return [
            'notifications' => $notifications,
            'hasMore' => $hasMore,
        ];
    }


    /**
     * Crée une notification lorsqu'un utilisateur est affecté à une UE
     */
    public function createAffectationNotification(
        EntityManagerInterface $entityManager,
        Utilisateur $utilisateur,
        UE $ue,
        Utilisateur $expediteur
    ): void {
        $notification = new Notification();

        $notification->setContenu("ous avez affecté à l'UE : ");

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

    /**
     * Crée une notification lorsqu'un utilisateur est affecté à une UE
     */
    public function createAjoutPublicationNotification(
        EntityManagerInterface $entityManager,
        Utilisateur $utilisateur,
        UE $ue,
        Utilisateur $expediteur,
        int $codeId,
        int $typePublicationId,
    ): void {
        $notification = new Notification();

        $notification->setContenu("ous avez affecté à l'UE : ");

        $roles = $utilisateur->getRoles();

        if($typePublicationId === 1) {
            $typeNotification = $entityManager->getRepository(TypeNotification::class)->findOneBy(['id' => 1]);
        } else {
            $typeNotification = $entityManager->getRepository(TypeNotification::class)->findOneBy(['id' => 1]);

        }

        if(in_array('ROLE_PROFESSEUR', $roles)) {
            $notification->setUrlDestination('professeur/contenu_ue-' . $ue->getId());
        }else if(in_array('ROLE_ELEVE', $roles)){
            $notification->setUrlDestination('etudiant/contenu_ue-' . $ue->getId());
        }

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
