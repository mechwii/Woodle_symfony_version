<?php

namespace App\Entity;

use App\Repository\EstAffecteRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EstAffecteRepository::class)]
class EstAffecte
{

    #[ORM\Id]
    #[ORM\ManyToOne(inversedBy: 'estAffectes')]
    #[ORM\JoinColumn(name: "utilisateur_id", referencedColumnName: "id_utilisateur", nullable: false)]
    private ?Utilisateur $utilisateur_id = null;

    #[ORM\Id]
    #[ORM\ManyToOne(inversedBy: 'estAffectes')]
    #[ORM\JoinColumn(name: "code_id", referencedColumnName: "code", nullable: false)]
    private ?UE $code_id = null;

    #[ORM\Column(nullable: true)]
    private ?bool $favori = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $date_inscription = null;

    public function getUtilisateurId(): ?Utilisateur
    {
        return $this->utilisateur_id;
    }

    public function setUtilisateurId(?Utilisateur $utilisateur_id): static
    {
        $this->utilisateur_id = $utilisateur_id;

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

    public function isFavori(): ?bool
    {
        return $this->favori;
    }

    public function setFavori(?bool $favori): static
    {
        $this->favori = $favori;

        return $this;
    }

    public function getDateInscription(): ?\DateTimeInterface
    {
        return $this->date_inscription;
    }

    public function setDateInscription(?\DateTimeInterface $date_inscription): static
    {
        $this->date_inscription = $date_inscription;

        return $this;
    }
}
