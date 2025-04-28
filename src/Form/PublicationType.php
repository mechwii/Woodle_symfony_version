<?php

namespace App\Form;

use App\Entity\Publication;
use App\Entity\Section;
use App\Entity\TypePublication;
use App\Entity\UE;
use App\Entity\Utilisateur;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\File;

class PublicationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('titre')
            ->add('description')
//            ->add('contenu')
            ->add('contenuTexte', TextType::class, [
                'required' => false,
            ])
            ->add('contenuFichier', FileType::class, [
                'label' => 'Fichier (PDF ou ZIP)',
                'required' => false,
                'mapped' => false, // <- très important : on gère manuellement dans ton controller
                'attr' => [
                    'accept' => '.zip, .pdf' // important pour forcer le type d'upload visuellement
                ],
            ])
            ->add('derniere_modif', null, [
                'widget' => 'single_text',
            ])
            ->add('ordre')
            ->add('visible')
            ->add('section_id', EntityType::class, [
                'class' => Section::class,
                'choice_label' => 'id',
            ])
            ->add('utilisateur_id', EntityType::class, [
                'class' => Utilisateur::class,
                'choice_label' => 'id',
            ])
            ->add('type_publication_id', EntityType::class, [
                'class' => TypePublication::class,
                'choice_label' => 'nom',
                'choice_value' => 'id',
            ])
            ->add('code_id', EntityType::class, [
                'class' => UE::class,
                'choice_label' => 'id',
            ])
            ->add('save', SubmitType::class, [
                'label' => 'Enregistrer',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Publication::class,
        ]);
    }
}
