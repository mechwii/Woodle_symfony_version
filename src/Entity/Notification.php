<?php

namespace App\Entity;

use App\Repository\NotificationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificationRepository::class)]
class Notification
{
    #[ORM\Id]
    #[ORM\Column(name: "id_notification", type: "integer")]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $contenu = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $date_notif = null;

    #[ORM\Column(length: 255)]
    private ?string $url_destination = null;

    // (inversedBy: 'notifications') + penser à enlever les nullable
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "type_notification_id", referencedColumnName: "id_type_notification")]
    private ?TypeNotification $type_notification_id = null;

    // (inversedBy: 'notifications')
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "utilisateur_expediteur_id", referencedColumnName: "id_utilisateur",  nullable: false)]
    private ?Utilisateur $utilisateur_expediteur_id = null;

    // (inversedBy: 'notifications')
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "utilisateur_destinataire_id", referencedColumnName: "id_utilisateur",  nullable: false)]
    private ?Utilisateur $utilisateur_destinataire_id = null;

    // (inversedBy: 'notifications')
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "code_id", referencedColumnName: "code",  nullable: false)]
    private ?UE $code_id = null;

    // (inversedBy: 'notifications')
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "priorite_id", referencedColumnName: "id_priorite")]
    private ?Priorite $priorite_id = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContenu(): ?string
    {
        return $this->contenu;
    }

    public function setContenu(string $contenu): static
    {
        $this->contenu = $contenu;

        return $this;
    }

    public function getDateNotif(): ?\DateTimeInterface
    {
        return $this->date_notif;
    }

    public function setDateNotif(\DateTimeInterface $date_notif): static
    {
        $this->date_notif = $date_notif;

        return $this;
    }

    public function getUrlDestination(): ?string
    {
        return $this->url_destination;
    }

    public function setUrlDestination(string $url_destination): static
    {
        $this->url_destination = $url_destination;

        return $this;
    }

    public function getTypeNotificationId(): ?TypeNotification
    {
        return $this->type_notification_id;
    }

    public function setTypeNotificationId(?TypeNotification $type_notification_id): static
    {
        $this->type_notification_id = $type_notification_id;

        return $this;
    }

    public function getUtilisateurExpediteurId(): ?Utilisateur
    {
        return $this->utilisateur_expediteur_id;
    }

    public function setUtilisateurExpediteurId(?Utilisateur $utilisateur_expediteur_id): static
    {
        $this->utilisateur_expediteur_id = $utilisateur_expediteur_id;

        return $this;
    }

    public function getUtilisateurDestinataireId(): ?Utilisateur
    {
        return $this->utilisateur_destinataire_id;
    }

    public function setUtilisateurDestinataireId(?Utilisateur $utilisateur_destinataire_id): static
    {
        $this->utilisateur_destinataire_id = $utilisateur_destinataire_id;

        return $this;
    }

    public function getCodeId(): ?UE
    {
        return $this->code_id;
    }

    public function setCodeId(?UE $code_id): static
    {
        $this->code_id = $code_id;

        return $this;
    }

    public function getPrioriteId(): ?Priorite
    {
        return $this->priorite_id;
    }

    public function setPrioriteId(?Priorite $priorite_id): static
    {
        $this->priorite_id = $priorite_id;

        return $this;
    }
}
