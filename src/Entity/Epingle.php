<?php

namespace App\Entity;

use App\Repository\EpingleRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EpingleRepository::class)]
class Epingle
{
    #[ORM\Id]
    #[ORM\JoinColumn(name: "utilisateur_id", referencedColumnName: "id_utilisateur", onDelete: "CASCADE")]
    #[ORM\ManyToOne(inversedBy: 'epingles')]
    private ?Utilisateur $utilisateur_id = null;

    #[ORM\Id]
    #[ORM\JoinColumn(name: "publication_id", referencedColumnName: "id_publication", onDelete: "CASCADE")]
    #[ORM\ManyToOne(inversedBy: 'epingles')]
    private ?Publication $publication_id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $date_epingle = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUtilisateurId(): ?Utilisateur
    {
        return $this->utilisateur_id;
    }

    public function setUtilisateurId(?Utilisateur $utilisateur_id): static
    {
        $this->utilisateur_id = $utilisateur_id;

        return $this;
    }

    public function getPublicationId(): ?Publication
    {
        return $this->publication_id;
    }

    public function setPublicationId(?Publication $publication_id): static
    {
        $this->publication_id = $publication_id;

        return $this;
    }

    public function getDateEpingle(): ?\DateTimeInterface
    {
        return $this->date_epingle;
    }

    public function setDateEpingle(?\DateTimeInterface $date_epingle): static
    {
        $this->date_epingle = $date_epingle;

        return $this;
    }
}
