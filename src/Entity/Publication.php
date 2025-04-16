<?php

namespace App\Entity;

use App\Repository\PublicationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PublicationRepository::class)]
class Publication
{
    #[ORM\Id]
    #[ORM\Column(name: "id_publication", type: "integer")]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $titre = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 50)]
    private ?string $contenu = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $derniere_modif = null;

    #[ORM\Column(nullable: true)]
    private ?int $ordre = null;

    #[ORM\Column]
    private ?bool $visible = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "section_id", referencedColumnName: "id_section")]
    private ?Section $section_id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "utilisateur_id", referencedColumnName: "id_utilisateur")]
    private ?Utilisateur $utilisateur_id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "type_publication_id", referencedColumnName: "id_type_publication")]
    private ?TypePublication $type_publication_id = null;

    // (inversedBy: 'publications')
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "code_id", referencedColumnName: "code")]
    private ?UE $code_id = null;

    /**
     * @var Collection<int, Epingle>
     */
    #[ORM\OneToMany(targetEntity: Epingle::class, mappedBy: 'publication_id')]
    private Collection $epingles;

    public function __construct()
    {
        $this->epingles = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitre(): ?string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): static
    {
        $this->titre = $titre;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
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

    public function getDerniereModif(): ?\DateTimeInterface
    {
        return $this->derniere_modif;
    }

    public function setDerniereModif(?\DateTimeInterface $derniere_modif): static
    {
        $this->derniere_modif = $derniere_modif;

        return $this;
    }

    public function getOrdre(): ?int
    {
        return $this->ordre;
    }

    public function setOrdre(?int $ordre): static
    {
        $this->ordre = $ordre;

        return $this;
    }

    public function isVisible(): ?bool
    {
        return $this->visible;
    }

    public function setVisible(bool $visible): static
    {
        $this->visible = $visible;

        return $this;
    }

    public function getSectionId(): ?Section
    {
        return $this->section_id;
    }

    public function setSectionId(?Section $section_id): static
    {
        $this->section_id = $section_id;

        return $this;
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

    public function getTypePublicationId(): ?TypePublication
    {
        return $this->type_publication_id;
    }

    public function setTypePublicationId(?TypePublication $type_publication_id): static
    {
        $this->type_publication_id = $type_publication_id;

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

    /**
     * @return Collection<int, Epingle>
     */
    public function getEpingles(): Collection
    {
        return $this->epingles;
    }

    public function addEpingle(Epingle $epingle): static
    {
        if (!$this->epingles->contains($epingle)) {
            $this->epingles->add($epingle);
            $epingle->setPublicationId($this);
        }

        return $this;
    }

    public function removeEpingle(Epingle $epingle): static
    {
        if ($this->epingles->removeElement($epingle)) {
            // set the owning side to null (unless already changed)
            if ($epingle->getPublicationId() === $this) {
                $epingle->setPublicationId(null);
            }
        }

        return $this;
    }
}
