export default {
  alerts: {
    'future-filing': {
      title: '',
      description: "Le prochain Rapport Annuel de cette entreprise n'est pas dû avant le {date}. Veuillez déposer le Rapport Annuel à partir de cette date."
    },
    'invalid-next-ar-year': {
      title: 'Année de Rapport Annuel invalide',
      description: "L'année suivante du Rapport Annuel est invalide ou manquante."
    },
    'missing-token': {
      title: '',
      description: "Jeton manquant pour récupérer les détails de l'entreprise."
    },
    'internal-server-error': {
      title: '',
      description: "Erreur de serveur interne, veuillez réessayer plus tard ou contactez-nous pour obtenir de l'aide."
    },
    'invalid-token': {
      title: 'Jeton Invalide',
      description: "Erreur lors de la récupération des détails de l'entreprise avec le jeton fourni."
    },
    'business-details': {
      title: '',
      description: "Erreur lors de la récupération des détails de l'entreprise."
    },
    'account-access': {
      title: 'Accès Refusé',
      description: "Votre compte n'est pas autorisé à effectuer cette tâche."
    },
    'payment-error': {
      title: 'Paiement Incomplet',
      description: "Votre paiement n'a pas été finalisé, veuillez réessayer."
    },
    'ar-submit-error': {
      title: 'Erreur de Soumission',
      description: "Une erreur s'est produite lors du traitement de votre demande. Veuillez confirmer vos informations et réessayer. Si le problème persiste, contactez le support pour obtenir de l'aide."
    },
    'create-account': {
      title: 'Erreur de Création de Compte',
      description: "Veuillez vérifier vos coordonnées et réessayer. Si le problème persiste, veuillez contacter le support pour obtenir de l'aide."
    },
    'tos-patch-error': {
      title: "Erreur des Conditions d'Utilisation",
      description: "Nous n'avons pas pu mettre à jour les Conditions d'Utilisation pour le moment. Veuillez réessayer plus tard ou nous contacter pour obtenir de l'aide."
    },
    'filing-in-progress': {
      title: 'Soumission en Cours',
      description: 'Votre soumission a été payée et est actuellement en cours de traitement.'
    },
    'document-download': {
      title: 'Échec du Téléchargement',
      description: 'Impossible de télécharger le document pour le moment. Veuillez réessayer ou contacter le support si le problème persiste.'
    },
    'future-effective-filings': {
      title: 'Dépôt en Attente Trouvé',
      description: 'Il y a un dossier en attente pour cette entreprise trouvé dans CorporateOnLine qui doit être complété avant que vous puissiez poursuivre cette tâche. Veuillez revenir une fois ce dépôt terminé.'
    },
    'inactive-corp-state': {
      title: 'Entreprise Inactive',
      description: "Cette entreprise est actuellement inactive. Vous ne pouvez pas continuer cette tâche tant que l'entreprise n'est pas réactivée. Veuillez contacter le support pour obtenir de l'aide."
    },
    'fee-info': {
      title: 'Erreur de Frais',
      description: 'Erreur lors de la récupération des frais, veuillez réessayer ou revenir plus tard.'
    }
  },
  btn: {
    getStarted: 'Commencer',
    goHome: 'Accueil',
    goBack: 'Retourner',
    dashboard: 'Dashboard',
    sbcConnect: 'Service Connect CB',
    copy: 'Copier',
    copied: 'Copié!',
    submit: 'Soumettre',
    next: 'Suivant',
    previous: 'Précédent',
    openMainNav: 'Ouvrir le menu de Navigation Principal',
    closeMainNav: 'Fermer le menu de Navigation Principal',
    loginBCSC: 'Connectez-vous avec la Carte Service CB',
    createNewAccount: 'Créer un Nouveau Compte',
    createAccount: 'Créer un Compte',
    useThisAccount: {
      main: 'Utiliser ce Compte',
      aria: 'Utiliser le Compte, {name}'
    },
    logout: 'Se Déconnecter',
    saveAccountAndFileAr: 'Enregistrer le Compte et Déposer le Rapport Annuel',
    submitAndPay: 'Soumettre et Payer',
    accountOptions: "Menu d'options pour Compte",
    accept: 'Accepter',
    decline: 'Déclin',
    close: 'Fermer',
    openHelpDocs: "Lire la Vue d'Ensemble",
    downloadReceipt: 'Télécharger le Reçu',
    downloadReport: 'Télécharger le Rapport',
    info: {
      show: 'Afficher les informations',
      hide: 'Masquer les informations'
    },
    colsToShow: {
      label: 'Colonnes à Afficher',
      aria: 'Colonnes à Afficher, {count} sélectionnés'
    },
    busGetStarted: {
      label: 'Commencez avec un diplôme en CB Entreprise basée',
      tooltip: 'Accédez à Demande de nom pour démarrer avec une entreprise nommée ou numérotée.'
    },
    busStartHelp: {
      show: "Aide à la Création et à la Gestion d'une Entreprise",
      hide: "Masquer l'Aide"
    },
    moreOptions: "Plus d'options",
    clearFilters: 'Effacer les Filtres',
    help: 'Aide',
    hideHelp: "Masquer l'Aide",
    tryAgain: 'Essayer à nouveau',
    cancel: 'Annuler',
    ok: "D'accord"
  },
  contactInfo: {
    bcRegGeneral: {
      title: 'Si ce problème persiste, veuillez nous contacter à:',
      tollFree: {
        title: 'Sans Frais:',
        value: '1-877-370-1033'
      },
      victoriaOffice: {
        title: 'Bureau de Victoria:',
        value: '1-250-370-1033'
      },
      email: {
        title: 'Email:',
        value: "BCRegistries{'@'}gov.bc.ca"
      },
      hours: {
        title: "Heures d'Ouverture:",
        value: 'Du Lundi au Vendredi, 8:30am - 4:30pm heure du Pacifique'
      }
    }
  },
  currency: {
    cad: 'CAD',
    usd: 'USD'
  },
  error: {
    generic: {
      title: "Quelque Chose S'est Mal Passé",
      description: "Une erreur s'est produite, veuillez réessayer. Si cette erreur persiste, veuillez nous contacter."
    },
    businessAdd: {
      title: "Error lors de l'ajout de l'Entreprise Existante",
      description: "Une erreur s'est produite lors de l'ajout de votre entreprise. Veuillez réessayer."
    },
    magicLinkUnauthorized: {
      title: 'Impossible De Gérer L\'entreprise',
      description: 'Le compte qui a demandé l\'autorisation ne correspond pas à votre compte actuel. Veuillez vous connecter avec le compte qui a initié la demande.'
    },
    magicLinkExpired: {
      title: 'Lien Expiré',
      description: 'Votre demande d\'autorisation pour gérer {identifier} a expiré. Veuillez réessayer.'
    },
    magicLinkAlreadyAdded: {
      title: 'Entreprise Déjà Ajoutée',
      description: 'L\'entreprise {identifier} est déjà dans votre liste du Registre des entreprises.'
    },
    magicLinkIncorporateNowError: {
      title: 'Erreur de Traitement du Lien',
      description: 'Le lien semble avoir été mal saisi. Veuillez revenir en arrière et cliquer sur le lien complet.'
    }
  },
  entityAlertTypes: {
    FROZEN: 'Cette entreprise est gelée',
    BAD_STANDING: "Cette entreprise n'est pas en règle",
    LIQUIDATION: 'Cette entreprise est en liquidation',
    DISSOLUTION: 'Cette entreprise est en cours de dissolution',
    PROCESSING: "Cette demande de dénomination est encore en cours de traitement, cela peut prendre jusqu'à 10 minutes.",
    EXPIRED: "Cette demande d'incorporation n'est plus valide; la demande de dénomination est expirée."
  },
  form: {
    manageNR: {
      heading: 'Gérer une Demande de Nom',
      requestedNames: 'Nom Demandé: | Noms Demandés:',
      nrNum: 'Nom Numéro de Demande:',
      legend: "Entrez soit le numéro de téléphone du candidat OU l'adresse e-mail du candidat qui ont été utilisés lorsque le nom a été demandé:",
      fields: {
        phone: {
          help: 'Exemple: 555-555-5555',
          placeholder: 'Numéro de téléphone du demandeur',
          arialabel: 'Numéro de téléphone du demandeur',
          error: {
            invalid: 'Veuillez entrer un numéro de téléphone valide (e.g., 123-456-7890).'
          }
        },
        email: {
          help: "Exemple: name{'@'}email.com",
          placeholder: 'Adresse e-mail du candidat',
          arialabel: 'Adresse e-mail du candidat',
          error: {
            invalid: "Veuillez entrer un email valide (e.g., name{'@'}email.com)."
          }
        },
        alert: {
          bothEmpty: 'Au moins un moyen de contact (e-mail ou téléphone) doit être fourni.',
          bothInvalid: 'Les deux champs ne sont pas valides. Veuillez saisir soit un numéro de téléphone valide, soit un e-mail valide.'
        }
      },
      submitBtn: 'Gérer cette Demande de Nom',
      help: {
        heading: "Besoin d'aide?",
        description: "Si vous avez perdu votre reçu ou votre e-mail de résultats de nom et avez besoin d'aide pour trouver votre numéro de demande de nom (NR), veuillez nous contacter à:"
      },
      error: {
        default: {
          title: "Erreur Lors De L'Ajout De La Demande De Nom",
          description: "Impossible d'ajouter la demande de nom pour le moment, veuillez réessayer ou revenir plus tard."
        },
        400: {
          title: "Erreur Lors De L'Ajout De La Demande De Nom",
          description: "L'email ou le numéro de téléphone que vous avez entré ne correspond pas avec l'application pour votre demande de nom."
        },
        404: {
          title: 'Demande De Nom Introuvable',
          description: 'La demande de nom spécifiée est introuvable.'
        },
        500: {
          title: 'Erreur Interne Du Serveur',
          description: "Impossible d'ajouter la demande de nom pour le moment, veuillez réessayer ou revenir plus tard."
        }
      },
      successToast: '{nrNum} a été ajouté avec succès à votre table.'
    },
    manageBusiness: {
      heading: 'Gérer une entreprise de la C.B.',
      businessName: "{boldStart}Nom de l'entreprise:{boldEnd} {name}",
      businessNumber: "{boldStart}Numéro d'incorporation:{boldEnd} {number}",
      missingInfo: {
        p1: 'Certaines informations requises pour cette entreprise sont manquantes.',
        p2: "L'entreprise n'a pas de mot de passe / code d'accès ou d'adresse e-mail enregistrée. Veuillez nous contacter pour obtenir de l'aide :"
      },
      legend: "Vous devez être autorisé à gérer cette entreprise. Vous pouvez être autorisé de l'une des manières suivantes :",
      authOption: {
        passcode: {
          accordianLabel: {
            default: "Utiliser le mot de passe de l'entreprise",
            coopOrBen: "Utiliser le code d'accès de l'entreprise"
          },
          fields: {
            passcode: {
              arialabel: {
                coop: "Entrez le code d'accès de l'entreprise",
                default: "Entrez le mot de passe de l'entreprise"
              },
              placeholder: {
                coop: "Code d'accès",
                default: 'Mot de passe'
              },
              help: {
                coop: "Le code d'accès doit comporter exactement 9 chiffres",
                default: 'Le mot de passe doit comporter entre 8 et 15 caractères'
              },
              error: {
                coop: {
                  required: "Le code d'accès est requis, entrez le code d'accès que vous avez configuré dans Corporate Online",
                  length: "Le code d'accès doit comporter exactement 9 chiffres",
                  type: "Le code d'accès doit être numérique"
                },
                default: {
                  required: 'Le mot de passe est requis',
                  length: 'Le mot de passe doit comporter entre 8 et 15 caractères'
                }
              }
            }
          }
        },
        firm: {
          accordianLabel: {
            default: "Utiliser le nom d'un propriétaire ou d'un partenaire"
          },
          fields: {
            name: {
              arialabel: 'Nom du propriétaire ou du partenaire (ex : Nom de famille, Prénom, Second prénom)',
              placeholder: 'Nom du propriétaire ou du partenaire (ex : Nom de famille, Prénom, Second prénom)',
              help: "Nom tel qu'il apparaît sur le résumé d'entreprise ou la déclaration d'enregistrement",
              error: {
                required: 'Le nom du propriétaire ou du partenaire est requis',
                max: 'Maximum de 150 caractères'
              }
            },
            certify: {
              label: "{boldStart}{name}{boldEnd} certifie qu'il a une connaissance pertinente de l'entité enregistrée et est autorisé à agir au nom de cette entreprise.",
              error: 'Veuillez certifier pour continuer'
            }
          }
        },
        email: {
          accordianLabel: {
            default: "Confirmer l'autorisation en utilisant votre adresse e-mail",
            firm: "Confirmer l'autorisation en utilisant l'adresse e-mail de votre entreprise",
            corpOrBenOrCoop: "Confirmer l'autorisation en utilisant l'adresse e-mail de votre bureau enregistré (si vous avez oublié ou n'avez pas de code d'accès)"
          },
          sentTo: {
            default: "Un e-mail sera envoyé à l'adresse e-mail de contact de l'entreprise :",
            firm: "Un e-mail sera envoyé à l'adresse e-mail de contact de l'entreprise :",
            corpOrBenOrCoop: "Un e-mail sera envoyé à l'adresse e-mail de contact du bureau enregistré de l'entreprise :"
          },
          instructions: "Pour confirmer votre accès, cliquez sur le lien dans l'e-mail. Cela ajoutera l'entreprise à votre liste de registres d'entreprises. Le lien est valable pendant 15 minutes."
        },
        delegation: {
          accordianLabel: {
            default: "Demander une autorisation à un compte qui gère actuellement l'entreprise"
          },
          fields: {
            account: {
              label: 'Sélectionner un compte :',
              placeholder: 'Sélectionner un compte',
              arialabel: 'Sélectionner un compte : sélection actuelle, {account}',
              error: {
                required: 'Veuillez sélectionner un compte pour continuer'
              }
            },
            message: {
              label: "Vous pouvez ajouter un message qui sera inclus dans votre demande d'autorisation.",
              placeholder: "Message supplémentaire pour la demande d'accès"
            }
          }
        }
      },
      emailSent: {
        heading: "E-mail d'autorisation envoyé",
        p1: 'Un e-mail a été envoyé à {boldStart}{email}{boldEnd}',
        p2: "Confirmez votre accès en cliquant sur le lien à l'intérieur. Cela ajoutera l'entreprise à votre liste de registres d'entreprises. Le lien est valable pendant 15 minutes."
      },
      toast: {
        success: '{identifier} a été ajouté avec succès à votre tableau.',
        emailSent: "E-mail de confirmation envoyé, en attente d'autorisation."
      },
      error: {
        email: {
          title: "Erreur lors de l'envoi de l'e-mail d'autorisation",
          description: "Une erreur est survenue lors de l'envoi de l'e-mail d'autorisation. Veuillez réessayer."
        },
        delegation: {
          title: "Erreur lors de la création de la demande d'invitation d'autorisation",
          description: "Une erreur est survenue lors de la création de l'invitation d'autorisation. Veuillez réessayer plus tard."
        },
        passcode: {
          401: {
            coop: {
              title: "Code d'accès invalide",
              description: "Impossible d'ajouter l'entreprise. Le code d'accès fourni est invalide."
            },
            default: {
              title: 'Mot de passe invalide',
              description: "Impossible d'ajouter l'entreprise. Le mot de passe fourni est invalide."
            }
          },
          404: {
            title: 'Entreprise non trouvée',
            description: "L'entreprise spécifiée n'a pas été trouvée."
          },
          400: {
            title: 'Entreprise déjà ajoutée',
            description: "L'entreprise {name} avec le numéro {identifier} est déjà dans votre liste de registres d'entreprises."
          },
          406: {
            title: "Code d'accès déjà réclamé",
            description: "Ce code d'accès a déjà été réclamé. Si vous avez des questions, veuillez nous contacter."
          },
          default: {
            title: "Quelque chose s'est mal passé",
            description: 'Une erreur est survenue, veuillez réessayer. Si cette erreur persiste, veuillez nous contacter.'
          }
        },
        firm: {
          401: {
            title: 'Nom du propriétaire ou du partenaire invalide (p. ex., Nom de famille, Prénom Deuxième prénom)',
            description: "Impossible d'ajouter l'entreprise. Le nom du propriétaire ou du partenaire fourni (p. ex., nom de famille, prénom deuxième prénom) est invalide."
          },
          404: {
            title: 'Entreprise non trouvée',
            description: "L'entreprise spécifiée n'a pas été trouvée."
          },
          400: {
            title: 'Entreprise déjà ajoutée',
            description: "L'entreprise {name} avec le numéro {identifier} est déjà dans votre liste de registres d'entreprises."
          },
          default: {
            title: "Quelque chose s'est mal passé",
            description: 'Une erreur est survenue, veuillez réessayer. Si cette erreur persiste, veuillez nous contacter.'
          }
        }
      },
      submitBtn: 'Gérer cette entreprise',
      noOptionAlert: 'Veuillez sélectionner une option dans la liste ci-dessus'
    }
  },
  labels: {
    note: 'Note',
    optional: 'Optionnel',
    characters: 'caractères',
    buttons: {
      back: 'Précédent',
      cancel: 'Annuler',
      fileNowNoFee: 'Déposer maintenant (sans frais)',
      reviewConfirm: 'Réviser et Confirmer',
      save: 'Sauvegarder',
      saveExit: 'Sauvegarder et Reprendre Plus Tard'
    },
    birthdate: 'Date de Naissance',
    competency: 'Compétence',
    citizenship: 'Citoyenneté',
    citizenshipPR: 'Citoyenneté/Résidence Permanente',
    emailAddress: 'Adresse e-mail',
    fullName: 'Nom Légal Complet',
    preferredName: 'Nom Préféré',
    address: 'Adresse',
    addressResidential: 'Adresse Résidentielle',
    state: 'État',
    country: 'Pays',
    line1: "Ligne d'adresse 1",
    line2: "Ligne d'adresse 2 (Facultatif)",
    city: 'Ville',
    region: 'Région (Facultatif)',
    postalCode: 'Code Postal',
    locationDescription: 'Description du Lieu (Facultatif)',
    countryOfCitizenship: {
      citizen: 'Citoyen du Canada',
      pr: 'Résident Permanent du Canada',
      others: 'Autre(s) Nationalité(s)',
      selectAll: 'Sélectionnez tous les pays dont cette personne est citoyenne.',
      placeholder: 'Pays de Citoyenneté',
      findCountry: 'Trouver un Pays',
      select: 'Sélectionner',
      selected: 'Sélectionné'
    },
    findACountry: 'Trouver un Pays',
    services: {
      bcsc: 'la Carte Service CB',
      bceid: 'BCeID',
      idir: 'IDIR'
    },
    socialInsuranceNumber: "Numéro d'assurance sociale",
    taxNumber: "Numéro d'impot",
    busName: "Nom de l'entreprise",
    corpNum: 'Numéro de constitution',
    busNum: "Numéro d'entreprise",
    arDate: 'Date du Rapport Annuel',
    name: 'Nom',
    mailingAddress: 'Adresse Postale',
    deliveryAddress: 'Adresse de Livraison',
    effectiveDates: "Dates d'Effet",
    apptDate: '{date} à actuel',
    sameAsMailAddress: "Identique à l'Adresse Postale",
    registeredOffice: 'Siège Social',
    recordsOffice: 'Bureau des Archives',
    office: 'Bureau',
    status: 'Statut',
    number: 'Nombre',
    type: 'Taper',
    actions: 'Actions',
    myList: '{boldStart}Ma liste{boldEnd} ({count})',
    amalgamateNow: 'Fusionner Maintenant',
    alterNow: 'Modifier Maintenant',
    changeNameNow: 'Changer de Nom Maintenant',
    continueInNow: 'Continuer Maintenant',
    downloadForm: 'Télécharger le Formulaire',
    registerNow: 'Enregistrer Maintenant',
    restoreNow: 'Restaurer Maintenant',
    reinstateNow: 'Réintégrer Maintenant',
    openNameRequest: 'Ouvrir la Demande de Nom',
    resumeDraft: 'Reprendre le Brouillon',
    removeFromTable: 'Supprimer du Tableau',
    manageBusiness: 'Gérer les Affaires',
    cancelRequest: 'Annuler la Demande',
    amalgamateNowShortForm: 'Fusionner Maintenant (Forme Courte)',
    noAffiliationRecords: "Aucun dossier d'affiliation",
    newRequest: 'Nouvelle Demande',
    resendEmail: 'Renvoyer le Courriel',
    removeFromList: 'Supprimer de la Liste',
    removeBusiness: "Supprimer l'Entreprise",
    bcRegDashboard: 'Tableau de Bord des Registres de la CB'
  },
  links: {
    busCorpAct: {
      main: 'Business Corporations Act',
      sect182: 'Business Corporations Act (Section 182)'
    }
  },
  modal: {
    manageBusiness: {
      success: {
        toast: 'Entreprise Ajoutée. Vous Pouvez Maintenant Gérer {identifier}.'
      }
    },
    removeBusiness: {
      generic: {
        NR: {
          title: 'Supprimer La Demande De Nom?',
          description: "Cette demande de nom sera supprimée de votre liste. Vous pourrez le rajouter ultérieurement en utilisant le champ de recherche. Cette demande de nom sera toujours valide jusqu'à ce qu'elle soit utilisée, annulée ou expirée.",
          primaryBtnLabel: 'Supprimer La Demande De Nom',
          secondaryBtnLabel: 'Conserver La Demande De Nom'
        },
        TMP: {
          title: "Supprimer La Demande D'Incorporation?",
          description: "La suppression de cette demande d'incorporation la retirera de votre liste de registre des entreprises. L'entreprise associée à cette demande ne sera pas incorporée. Si cette demande d'incorporation était associée à une demande de nom, la demande de nom pourra toujours être utilisée pour incorporer une entreprise.",
          primaryBtnLabel: "Supprimer La Demande D'Incorporation",
          secondaryBtnLabel: "Conserver La Demande D'Incorporation"
        },
        ATMP: {
          title: 'Supprimer La Demande De Fusion?',
          description: 'La suppression de cette demande de fusion la retirera de votre liste de registre des entreprises. Si cette demande de fusion était associée à une demande de nom, la demande de nom pourra toujours être utilisée pour initier une demande de fusion.',
          primaryBtnLabel: 'Supprimer La Demande De Fusion',
          secondaryBtnLabel: 'Conserver La Demande De Fusion'
        },
        RTMP: {
          title: "Supprimer L'Enregistrement?",
          description: "La suppression de cet enregistrement le retirera de votre liste de registre des entreprises. L'entreprise associée à cet enregistrement ne sera pas enregistrée. Si cet enregistrement était associé à une demande de nom, la demande de nom pourra toujours être utilisée pour enregistrer une entreprise.",
          primaryBtnLabel: "Supprimer L'Enregistrement",
          secondaryBtnLabel: "Conserver L'Enregistrement"
        },
        GP: {
          title: "Supprimer L'Enregistrement?",
          description: "La suppression de cet enregistrement le retirera de votre liste de registre des entreprises. Pour réintégrer l'entreprise à la liste de registre des entreprises plus tard, vous aurez besoin du numéro d'enregistrement de l'entreprise et du nom du propriétaire exactement comme il apparaît sur la demande d'enregistrement.",
          primaryBtnLabel: "Supprimer L'Enregistrement",
          secondaryBtnLabel: "Conserver L'Enregistrement"
        },
        SP: {
          title: "Supprimer L'Enregistrement?",
          description: "La suppression de cet enregistrement le retirera de votre liste de registre des entreprises. Pour réintégrer l'entreprise à la liste de registre des entreprises plus tard, vous aurez besoin du numéro d'enregistrement de l'entreprise et du nom du propriétaire exactement comme il apparaît sur la demande d'enregistrement.",
          primaryBtnLabel: "Supprimer L'Enregistrement",
          secondaryBtnLabel: "Conserver L'Enregistrement"
        }
      }
    },
    passcode: {
      form: {
        radio: {
          reset: {
            label: "Réinitialiser mon code d'accès et retirer l'entreprise",
            help: "L'entreprise sera retirée de ce compte,Un nouveau code d'accès sera généré et annulera l'ancien code d'accès,Le nouveau code d'accès sera envoyé par courriel à la personne responsable de la gestion de cette entreprise"
          },
          noReset: {
            label: "Ne pas réinitialiser mon code d'accès et retirer l'entreprise",
            help: "L'entreprise sera retirée de ce compte,Le code d'accès actuel pour cette entreprise sera annulé,Vous ne pourrez pas ajouter cette entreprise à votre compte sans un nouveau code d'accès"
          },
          legend: "Veuillez sélectionner l'une des deux options ci-dessous pour retirer cette entreprise du compte"
        },
        email: {
          arialabel: 'Adresse Courriel',
          placeholder: 'Adresse Courriel',
          error: {
            required: "L'adresse courriel est requise.",
            invalid: 'Veuillez entrer une adresse courriel valide.'
          }
        },
        confirmEmail: {
          arialabel: 'Confirmer Adresse Email',
          placeholder: 'Confirmer Adresse Email',
          error: {
            required: "La confirmation de l'adresse courriel est requise.",
            invalid: 'Veuillez entrer une adresse courriel valide.',
            match: 'Les adresses courriel doivent correspondre.'
          }
        }
      }
    },
    index: {
      successToast: 'Entreprise supprimée avec succès de votre liste.'
    }
  },
  words: {
    i: 'Je',
    addresses: 'Adresses',
    directors: 'Directeurs',
    confirm: 'Confirmer',
    select: 'Sélectionner',
    none: 'Aucun',
    or: 'ou',
    Or: 'Ou',
    error: 'erreur',
    Error: 'Erreur',
    OK: 'OK',
    remove: 'retirer',
    Remove: 'Retirer',
    added: 'ajouté',
    Added: 'Ajouté'
  },
  page: {
    notFound: {
      h1: 'Page introuvable'
    },
    home: {
      title: "Mon Registre d'Entreprise",
      h1: "Mon Registre d'Entreprise",
      intro: 'Commencer la CB entreprises basées et tenir à jour les dossiers commerciaux.',
      busOrNRSearch: {
        label: 'Rechercher une Entreprise Existante ou une Demande de Nom Active à Gérer:',
        placeholder: "Mon nom commercial, mon numéro d'entreprise, ou mon numéro d'enregistrement",
        help: 'Par exemple: "Joe\'s Plumbing Inc.", "BC1234567", "FM1234567"',
        opts: {
          legend: 'Choisissez de Rechercher soit une Entreprise Existante, soit une Demande de Nom',
          existingBus: 'Entreprise Existante',
          nr: 'Demande de Nom'
        }
      }
    },
    tos: {
      title: "Conditions d'Utilisation - Rapport Annuel de Service CB",
      h1: "Conditions d'Utilisation",
      form: {
        checkboxLabel: "J'ai lu et j'accepte les Conditions d'Utilisation",
        scrollError: "Veuillez faire défiler jusqu'en bas du document pour accepter les Conditions d'Utilisation",
        checkedError: "Vous devez accepter les Conditions d'Utilisation pour continuer"
      },
      modal: {
        title: "Refuser les Conditions d'Utilisation",
        content: "En refusant les Conditions d'Utilisation, vous ne pourrez pas continuer à utiliser ce service. Veuillez accepter les Conditions d'Utilisation pour continuer."
      }
    },
    help: {
      title: "Vue d'Ensemble du Rapport Annuel - Rapport Annuel de Service CB"
    }
  },
  search: {
    reg: {
      placeholder: "Mon nom commercial, mon numéro d'entreprise, ou mon numéro d'enregistrement",
      arialabel: "Commencez à taper pour effectuer une recherche par nom d'entreprise, numéro de société ou numéro d'enregistrement.",
      empty: {
        title: 'Aucune entreprise active en C.B. trouvée.',
        content: "Assurez-vous d'avoir entré le bon nom ou numéro d'entreprise."
      }
    },
    namex: {
      placeholder: 'Nom de mon entreprise ou numéro de demande de nom',
      arialabel: "Commencez à taper pour effectuer une recherche par nom d'entreprise ou numéro de demande de nom",
      empty: {
        title: 'Aucune demande de Nom Active trouvée',
        content: "Assurez-vous d'avoir saisi une Demande de Nom qui n'a pas expiré ou qui n'a pas été annulée."
      }
    }
  },
  table: {
    affiliation: {
      filter: {
        busName: {
          aria: "Filtrer par nom d'entreprise",
          placeholder: 'Nom',
          clear: {
            tooltip: 'Réinitialiser le Nom',
            aria: "Réinitialiser le nom de l'entreprise"
          }
        },
        busNumber: {
          aria: "Filtrer par numéro d'entreprise",
          placeholder: 'Nombre',
          clear: {
            tooltip: 'Réinitialiser le numéro',
            aria: "Réinitialiser le numéro d'entreprise"
          }
        },
        legalType: {
          aria: 'Filtre par type juridique, filtre actuel: {filter}',
          placeholder: 'Taper',
          selected: '{count} sélectionnés',
          clear: {
            tooltip: 'Types de réinitialisation',
            aria: 'Réinitialiser les types légaux'
          }
        },
        busStates: {
          aria: "Filtrer par statut d'entreprise, filtre actuel: {filter}",
          placeholder: 'Statut',
          selected: '{count} sélectionnés',
          clear: {
            tooltip: 'Statut de réinitialisation',
            aria: "Réinitialiser le statut de l'entreprise"
          }
        }
      },
      cell: {
        name: {
          approved: 'Demande de nom, {name}, approuvée',
          rejected: 'Demande de nom, {name}, rejetée'
        }
      }
    }
  },
  toast: {
    unableToAddNr: "Impossible d'ajouter la demande de nom",
    unableToAddBusiness: "Impossible d'ajouter l'entreprise",
    errorResendingAffInvite: "Erreur lors de la réexpédition de l'invitation à l'affiliation"
  },
  tooltips: {
    affiliationActionBtn: 'Accédez à {option} pour accéder à cette entreprise'
  },
  widgets: {
    feeSummary: {
      title: 'Résumé des Frais',
      total: 'Total des Frais',
      noFee: 'Pas de frais',
      priorityFees: 'Frais prioritaires',
      futureEffectiveFees: 'Frais effectifs futurs',
      serviceFees: 'Frais de Service',
      itemLabels: {
        TEST: 'This is test entry',
        REGSIGIN: 'Significant Individual Change',
        BCANN: 'Rapport Annuel CB'
      }
    }
  },
  // components
  ConnectHeader: {
    title: 'Registres et Services en Ligne de la CB'
  },
  AsyncComboBox: {
    resultsCount: '{count} résultats',
    error: 'Erreur lors de la récupération des résultats, veuillez réessayer plus tard.',
    resultListLabel: 'Résultats de la recherche',
    noResults: 'Aucun résultat trouvé'
  }
}
