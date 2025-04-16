<?php

namespace App\Entity;

use App\Repository\PrioriteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PrioriteRepository::class)]
#[ORM\Table(name: "priorite")]
class Priorite
{
    #[ORM\Id]
    #[ORM\Column(name: "id_priorite", type: "integer")]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $nom = null;

    /**
     * @var Collection<int, Notification>
     *
    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'priorite_id')]
    private Collection $notifications;*/

    public function __construct()
    {
        //$this->notifications = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    /**
     * @return Collection<int, Notification>
     *
    public function getNotifications(): Collection
    {
        return $this->notifications;
    }

    public function addNotification(Notification $notification): static
    {
        if (!$this->notifications->contains($notification)) {
            $this->notifications->add($notification);
            $notification->setPrioriteId($this);
        }

        return $this;
    }

    public function removeNotification(Notification $notification): static
    {
        if ($this->notifications->removeElement($notification)) {
            // set the owning side to null (unless already changed)
            if ($notification->getPrioriteId() === $this) {
                $notification->setPrioriteId(null);
            }
        }

        return $this;
    }*/
}
