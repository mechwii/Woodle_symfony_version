<?php

namespace App\Controller;

use App\Entity\EstAffecte;
use App\Entity\Notification;
use App\Entity\Priorite;
use App\Entity\Publication;
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
    /**
     * Récupérer toutes les notifications d'un utilisateur
     * @param EntityManagerInterface $BDDManager
     * @param Request $request
     * @return JsonResponse
     */
    #[Route('/notifications', name: 'notifications_index')]
    public function getNotifications(EntityManagerInterface $BDDManager, Request $request): JsonResponse
    {
        // On récupère l'utilsiateur connecté
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non connecté'], 401);
        }

        // On fixe un offset (qui commence à 0 et sera différent en fonction des requêtes)
        $offset = $request->query->getInt('offset', 0);
        //Limite de 4 requetes
        $limit = 4;

        // On récupère les notifications depuis une méthodes privées
        $notificationsData = $this->getNotificationsData($BDDManager, $user->getId(), $offset, $limit);

        // et on les retournes
        return new JsonResponse([
            'notifications' => $notificationsData['notifications'],
            'showMoreButton' => $notificationsData['hasMore'],
        ]);
    }

    /**
     * Permet de récuperer les notifications
     * @param EntityManagerInterface $BDDManager
     * @param int $userId
     * @param int $offset
     * @param int $limit
     * @return array
     * @throws \Doctrine\DBAL\Exception
     */
    public function getNotificationsData(EntityManagerInterface $BDDManager, int $userId, int $offset, int $limit): array
    {
        // On effectue une connexion pour pouvoir effectuer des requêtes SQL
        $connection = $BDDManager->getConnection();

        // Donc la on récupère toutes les notification, avec une jointure pour récupérer l'utilisateur emetteur de la ntpif
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

        // On compte aussi le nbr de notification pour savoir si on affiche plus ou non
        $countSql = 'SELECT COUNT(n.id_notification) as total FROM Notification n WHERE n.utilisateur_destinataire_id = :utilisateur_id';
        $total = $connection->executeQuery($countSql, ['utilisateur_id' => $userId])->fetchAssociative()['total'];

        $hasMore = ($offset + $limit) < $total;

        return [
            'notifications' => $notifications,
            'hasMore' => $hasMore,
        ];
    }


    /**
     *  Crée une notification lorsqu'un utilisateur est affecté à une UE
     * @param EntityManagerInterface $entityManager
     * @param Utilisateur $utilisateur
     * @param UE $ue
     * @param Utilisateur $expediteur
     * @return void
     */
    public function createAffectationNotification(
        EntityManagerInterface $entityManager,
        Utilisateur $utilisateur,
        UE $ue,
        Utilisateur $expediteur
    ): void {
        $notification = new Notification();

        $notification->setContenu("vous avez affecté à l'UE : ");

        $roles = $utilisateur->getRoles();

        // Donc en fonction du role de la personne, l'url de redirection est différente
        if(in_array('ROLE_PROFESSEUR', $roles)) {
            $notification->setUrlDestination('professeur/contenu_ue-' . $ue->getId());
        }else if(in_array('ROLE_ELEVE', $roles)){
            $notification->setUrlDestination('etudiant/contenu_ue-' . $ue->getId());
        }

        // On affecte aussi le type de notification
        $typeNotification = $entityManager->getRepository(TypeNotification::class)->findOneBy(['id' => 1]);
        if ($typeNotification) {
            $notification->setTypeNotificationId($typeNotification);
        }

        // Ici on remplit tous les champs nécessaires
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
     * Crée une notification à tous les utilisateurs liés à une UE lorsque un post est fait
     * @param EntityManagerInterface $entityManager
     * @param UE $ue
     * @param Utilisateur $expediteur
     * @param int $typePublicationId
     * @param Publication $publication
     * @param bool $isAdmin
     * @return void
     */
    public function createAjoutPublicationNotification(
        EntityManagerInterface $entityManager,
        UE $ue,
        Utilisateur $expediteur,
        int $typePublicationId,
        Publication $publication,
        bool $isAdmin
    ): void {
        $utilisateurInUE = $entityManager->getRepository(EstAffecte::class)->findBy(['code_id' => $ue]);

        foreach($utilisateurInUE as $util) {
            // On fait utilisateur un par un
            $utilisateur = $util->getUtilisateurId();
            // On met les notifs que pour les professeurs
            if($utilisateur !== $expediteur) {
                $notification = new Notification();


                $roles = $utilisateur->getRoles();

                // Le texte diffère en fonction du type de notification
                if($typePublicationId === 2) {
                    $typeNotification = $entityManager->getRepository(TypeNotification::class)->findOneBy(['id' => 5]);
                    $notification->setContenu("a ajouté le document " . $publication->getContenuFichier() . " dans ");

                } else {
                    $typeNotification = $entityManager->getRepository(TypeNotification::class)->findOneBy(['id' => 3]);
                    $notification->setContenu("a posté un nouveau message dans ");
                }

                // De base chaque priorité est à 1
                $priorite = $entityManager->getRepository(Priorite::class)->findOneBy(['id' => 1]);
                //$notification->setPrioriteId($priorite);


                // Ensuite
                if(in_array('ROLE_PROFESSEUR', $roles) || $isAdmin && $isAdmin == true) {
                   $notification->setUrlDestination('professeur/contenu_ue-' . $ue->getId());
                   // Si c'est un admin on met la priorité à 2 pour dire que la notification est importante
                   if($isAdmin && $isAdmin == true){
                       $priorite2 = $entityManager->getRepository(Priorite::class)->findOneBy(['id' => 2]);
                       $notification->setPrioriteId($priorite2);

                   } else{
                       // Sinon c'est une priorité normale
                       $notification->setPrioriteId($priorite);

                   }
                }
                else if(in_array('ROLE_ELEVE', $roles)){
                    $notification->setUrlDestination('etudiant/contenu_ue-' . $ue->getId());
                    $notification->setPrioriteId($priorite);
                }

                // Il y'a toujours une type notification mais on avait rencontré des problèmes
                if ($typeNotification) {
                    $notification->setTypeNotificationId($typeNotification);
                }

                // On remplit le reste des champs
                $notification->setUtilisateurExpediteurId($expediteur ?? $this->getUser());

                $notification->setUtilisateurDestinataireId($utilisateur);

                $notification->setCodeId($ue);



                $entityManager->persist($notification);
            }
        }
        $entityManager->flush();
    }

    /**
     * Il va mettre à jour la priorité de la notification la passant de admin_élevé à normale
     * @param EntityManagerInterface $entityManager
     * @param int $notification
     * @return JsonResponse
     */
    #[Route('/notifications/update-priorite/{notification}', name: 'notifications_update_priorite')]
    public function updateNotifPriorite(
        EntityManagerInterface $entityManager,
        int $notification,
    ): JSONResponse {
        $not = $entityManager->getRepository(Notification::class)->find($notification);
        $priorite = $entityManager->getRepository(Priorite::class)->findOneBy(['id' => 1]);

        if (!$not || !$priorite) {
            return new JsonResponse(['success' => false, 'message' => 'Notification ou priorité non trouvée'], JsonResponse::HTTP_NOT_FOUND);
        }

        $not->setPrioriteId($priorite);
        $entityManager->persist($not);
        $entityManager->flush();

        return new JSONResponse([
            'success' => true,
        ]);


    }


}
