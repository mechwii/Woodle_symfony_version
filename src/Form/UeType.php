<?php

namespace App\Form;

use App\Entity\UE;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;


class UeType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('id', null, [
                'row_attr' => ['class' => 'section-user-add-form'],
                'label' => 'Code UE',
            ])
            ->add('nom', null, [
                'row_attr' => ['class' => 'section-user-add-form'],
                'label' => 'Nom UE',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => UE::class,
        ]);
    }
}
