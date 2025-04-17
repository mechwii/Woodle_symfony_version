<?php

namespace App\Entity;

use App\Repository\UERepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UERepository::class)]
#[ORM\Table(name: "ue")]
class UE
{
    #[ORM\Id]
    #[ORM\Column(name: "code", length: 50)]
    private ?string $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nom = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 50)]
    private ?string $semestre = null;

    #[ORM\Column(length: 255)]
    private ?string $image = null;

    /**
     * @var Collection<int, Section>
     */
    #[ORM\OneToMany(targetEntity: Section::class, mappedBy: 'code_id')]
    private Collection $sections;

    /**
     * @var Collection<int, Controle>
     */
    #[ORM\OneToMany(targetEntity: Controle::class, mappedBy: 'code')]
    private Collection $controles;

    /**
     * @var Collection<int, EstAffecte>
     */
    #[ORM\OneToMany(targetEntity: EstAffecte::class, mappedBy: 'code_id')]
    private Collection $estAffectes;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "responsable_id", referencedColumnName: "id_utilisateur", onDelete: "SET NULL")]
    private ?Utilisateur $responsable_id = null;

    /**
     * @var Collection<int, Notification>
     *
    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'code_id')]
    private Collection $notifications;
     */

    /**
     * @var Collection<int, Publication>
    #[ORM\OneToMany(targetEntity: Publication::class, mappedBy: 'code_id')]
    private Collection $publications;
     **/

    public function __construct()
    {
        $this->sections = new ArrayCollection();
        $this->controles = new ArrayCollection();
       // $this->publications = new ArrayCollection();
      // $this->notifications = new ArrayCollection();
      $this->estAffectes = new ArrayCollection();

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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getSemestre(): ?string
    {
        return $this->semestre;
    }

    public function setSemestre(string $semestre): static
    {
        $this->semestre = $semestre;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(string $image): static
    {
        $this->image = $image;

        return $this;
    }

    /**
     * @return Collection<int, Controle>
     */
    public function getControle(): Collection
    {
        return $this->controles;
    }

    public function addControle(Controle $controle): static
    {
        if (!$this->controles->contains($controle)) {
            $this->controles->add($controle);
            $controle->setCode($this);
        }

        return $this;
    }

    public function removeControle(Controle $controle): static
    {
        if ($this->controles->removeElement($controle)) {
            // set the owning side to null (unless already changed)
            if ($controle->getCode() === $this) {
                $controle->setCode(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Section>
     */
    public function getSections(): Collection
    {
        return $this->sections;
    }

    public function addSection(Section $section): static
    {
        if (!$this->sections->contains($section)) {
            $this->sections->add($section);
            $section->setCodeId($this);
        }

        return $this;
    }

    public function removeSection(Section $section): static
    {
        if ($this->sections->removeElement($section)) {
            // set the owning side to null (unless already changed)
            if ($section->getCodeId() === $this) {
                $section->setCodeId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Publication>

    public function getPublications(): Collection
    {
        return $this->publications;
    }

    public function addPublication(Publication $publication): static
    {
        if (!$this->publications->contains($publication)) {
            $this->publications->add($publication);
            $publication->setCodeId($this);
        }

        return $this;
    }

    public function removePublication(Publication $publication): static
    {
        if ($this->publications->removeElement($publication)) {
            // set the owning side to null (unless already changed)
            if ($publication->getCodeId() === $this) {
                $publication->setCodeId(null);
            }
        }

        return $this;
    }
     */

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
            $notification->setCodeId($this);
        }

        return $this;
    }

    public function removeNotification(Notification $notification): static
    {
        if ($this->notifications->removeElement($notification)) {
            // set the owning side to null (unless already changed)
            if ($notification->getCodeId() === $this) {
                $notification->setCodeId(null);
            }
        }

        return $this;
    }*/

    /**
     * @return Collection<int, EstAffecte>
     */
    public function getEstAffectes(): Collection
    {
        return $this->estAffectes;
    }

    public function addEstAffecte(EstAffecte $estAffecte): static
    {
        if (!$this->estAffectes->contains($estAffecte)) {
            $this->estAffectes->add($estAffecte);
            $estAffecte->setCodeId($this);
        }

        return $this;
    }

    public function removeEstAffecte(EstAffecte $estAffecte): static
    {
        if ($this->estAffectes->removeElement($estAffecte)) {
            // set the owning side to null (unless already changed)
            if ($estAffecte->getCodeId() === $this) {
                $estAffecte->setCodeId(null);
            }
        }

        return $this;
    }

    public function getResponsableId(): ?Utilisateur
    {
        return $this->responsable_id;
    }

    public function setResponsableId(?Utilisateur $responsable_id): static
    {
        $this->responsable_id = $responsable_id;

        return $this;
    }
}
