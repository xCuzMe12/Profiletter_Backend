import type { CrmMessages } from "./englishCrmMessages";

export const slovenianCrmMessages: CrmMessages = {
  resources: {
    companies: {
      name: "Podjetje |||| Podjetja",
      forcedCaseName: "Podjetje",
      fields: {
        name: "Ime podjetja",
        website: "Spletna stran",
        linkedin_url: "LinkedIn URL",
        phone_number: "Telefonska številka",
        created_at: "Ustvarjeno",
        nb_contacts: "Število stikov",
        revenue: "Prihodek",
        sector: "Sektor",
        size: "Velikost",
        tax_identifier: "Davčna številka",
        address: "Naslov",
        city: "Mesto",
        zipcode: "Poštna številka",
        state_abbr: "Regija",
        country: "Država",
        description: "Opis",
        context_links: "Kontekstne povezave",
        sales_id: "Skrbnik računa",
      },
      empty: {
        description: "Seznam podjetij je prazen.",
        title: "Ni najdenih podjetij",
      },
      import: {
        title: "Uvozi podjetja",
      },
      field_categories: {
        contact: "Kontakt",
        additional_info: "Dodatne informacije",
        address: "Naslov",
        context: "Kontekst",
      },
      action: {
        create: "Ustvari podjetje",
        edit: "Uredi podjetje",
        new: "Novo podjetje",
        show: "Prikaži podjetje",
      },
      added_on: "Dodano %{date}",
      followed_by: "Sledi %{name}",
      followed_by_you: "Sledite vi",
      no_contacts: "Ni stikov",
      nb_contacts: "%{smart_count} stik |||| %{smart_count} stikov",
      nb_deals: "%{smart_count} lead |||| %{smart_count} leadov",
      sizes: {
        one_employee: "1 zaposleni",
        two_to_nine_employees: "2–9 zaposlenih",
        ten_to_forty_nine_employees: "10–49 zaposlenih",
        fifty_to_two_hundred_forty_nine_employees: "50–249 zaposlenih",
        two_hundred_fifty_or_more_employees: "250 ali več zaposlenih",
      },
      autocomplete: {
        create_error: "Pri ustvarjanju podjetja je prišlo do napake",
        create_item: "Ustvari %{item}",
        create_label: "Začnite tipkati za novo podjetje",
      },
    },
    contacts: {
      name: "Stranka |||| Stranke",
      forcedCaseName: "Stranka",
      field_categories: {
        background_info: "Ozadje",
        identity: "Identiteta",
        misc: "Razno",
        personal_info: "Osebni podatki",
        position: "Pozicija",
      },
      fields: {
        first_name: "Ime",
        last_name: "Priimek",
        last_seen: "Nazadnje videno",
        title: "Naziv",
        company_id: "Podjetje",
        email_jsonb: "E-poštni naslovi",
        email: "E-pošta",
        phone_jsonb: "Telefonske številke",
        phone_number: "Telefonska številka",
        linkedin_url: "LinkedIn URL",
        background: "Ozadje (bio, kako ste se spoznali …)",
        has_newsletter: "Prejema e-novice",
        sales_id: "Skrbnik računa",
      },
      action: {
        add: "Dodaj stranko",
        add_first: "Dodajte prvo stranko",
        create: "Ustvari stranko",
        edit: "Uredi stranko",
        export_vcard: "Izvozi v vCard",
        new: "Nova stranka",
        show: "Prikaži stranko",
      },
      background: {
        last_activity_on: "Zadnja aktivnost %{date}",
        added_on: "Dodano %{date}",
        followed_by: "Sledi %{name}",
        followed_by_you: "Sledite vi",
        status_none: "Brez",
      },
      position_at: "%{title} pri",
      position_at_company: "%{title} pri %{company}",
      empty: {
        description: "Seznam strank je prazen.",
        title: "Ni najdenih strank",
      },
      import: {
        title: "Uvozi stranke",
      },
      inputs: {
        genders: {
          male: "On",
          female: "Ona",
          nonbinary: "Oni",
        },
        personal_info_types: {
          work: "Služba",
          home: "Dom",
          other: "Drugo",
        },
      },
      list: {
        error_loading: "Napaka pri nalaganju stikov",
      },
      bulk_tag: {
        action: "Oznaka",
        back: "Nazaj na oznake",
        create_description:
          "Ustvarite novo oznako in jo dodelite izbranim stikom.",
        description:
          "Izberite obstoječo oznako ali ustvarite novo za izbrane stike.",
        empty: "Še ni oznak. Ustvarite eno za označevanje izbranih stikov.",
        error: "Oznake ni bilo mogoče dodati stikom",
        removed:
          "Oznaka odstranjena s %{smart_count} stika |||| Oznaka odstranjena s %{smart_count} stikov",
        success:
          "Oznaka dodana %{smart_count} stiku |||| Oznaka dodana %{smart_count} stikom",
        title: "Dodaj oznako stikom",
      },
      merge: {
        action: "Združi z drugim stikom",
        confirm: "Združi stike",
        current_contact: "Trenutni stik (bo izbrisan)",
        description: "Združite ta stik z drugim.",
        error: "Združevanje stikov ni uspelo",
        merging: "Združevanje…",
        no_additional_data: "Ni dodatnih podatkov za združitev",
        select_target: "Izberite stik za združitev",
        success: "Stiki uspešno združeni",
        target_contact: "Ciljni stik (bo ohranjen)",
        title: "Združi stik",
        warning_description:
          "Vsi podatki bodo preneseni na drugi stik. Tega dejanja ni mogoče razveljaviti.",
        warning_title: "Opozorilo: uničujoče dejanje",
        what_will_be_merged: "Kaj bo združeno:",
      },
      filters: {
        before_last_month: "Pred prejšnjim mesecem",
        before_this_month: "Pred tem mesecem",
        before_this_week: "Pred tem tednom",
        managed_by_me: "Upravljam jaz",
        search: "Išči ime, podjetje…",
        this_week: "Ta teden",
        today: "Danes",
        tags: "Oznake",
        tasks: "Opravila",
      },
      hot: {
        empty_change_status:
          'Status stika spremenite z dodajanjem opombe in klikom na "prikaži možnosti".',
        empty_hint: 'Tu se prikažejo stiki s statusom "vroče".',
        title: "Vroči stiki",
      },
    },
    deals: {
      name: "Lead |||| Leads",
      fields: {
        name: "Ime",
        description: "Opis",
        company_id: "Podjetje",
        contact_ids: "Stranke",
        category: "Kategorija",
        amount: "Proračun",
        expected_closing_date: "Pričakovan zaključek",
        stage: "Faza",
      },
      action: {
        back_to_deal: "Nazaj na lead",
        create: "Ustvari lead",
        new: "Nov lead",
      },
      field_categories: {
        misc: "Razno",
      },
      filters: {
        only_mine: "Samo leadi, ki jih upravljam",
      },
      archived: {
        action: "Arhiviraj",
        error: "Napaka: lead ni bil arhiviran",
        list_title: "Arhivirani leadi",
        success: "Lead arhiviran",
        title: "Arhiviran lead",
        view: "Prikaži arhivirane leade",
      },
      inputs: {
        linked_to: "Povezano z",
      },
      unarchived: {
        action: "Vrni na tablo",
        error: "Napaka: lead ni bil obnovljen",
        success: "Lead obnovljen",
      },
      updated: "Lead posodobljen",
      empty: {
        before_create: "pred ustvarjanjem leada.",
        description: "Seznam leadov je prazen.",
        title: "Ni najdenih leadov",
      },
      import: {
        title: "Uvozi leade",
      },
      invalid_date: "Neveljaven datum",
    },
    notes: {
      name: "Opomba |||| Opombe",
      forcedCaseName: "Opomba",
      fields: {
        status: "Status",
        date: "Datum",
        attachments: "Priloge",
        contact_id: "Stik",
        deal_id: "Lead",
      },
      action: {
        add: "Dodaj opombo",
        add_first: "Dodajte prvo opombo",
        delete: "Izbriši opombo",
        edit: "Uredi opombo",
        update: "Posodobi opombo",
        add_this: "Dodaj to opombo",
      },
      sheet: {
        create: "Ustvari opombo",
        create_for: "Ustvari opombo za %{name}",
        edit: "Uredi opombo",
        edit_for: "Uredi opombo za %{name}",
      },
      deleted: "Opomba izbrisana",
      empty: "Še ni opomb",
      author_added: "%{name} je dodal/a opombo",
      you_added: "Dodali ste opombo",
      me: "Jaz",
      list: {
        error_loading: "Napaka pri nalaganju opomb",
      },
      note_for_contact: "Opomba za %{name}",
      stepper: {
        hint: "Odprite stran stika in dodajte opombo",
      },
      added: "Opomba dodana",
      inputs: {
        add_note: "Dodaj opombo",
        options_hint: "(priložite datoteke ali spremenite podrobnosti)",
        show_options: "Prikaži možnosti",
      },
      actions: {
        attach_document: "Priloži dokument",
      },
      validation: {
        note_or_attachment_required: "Zahtevana je opomba ali priloga",
      },
    },
    sales: {
      name: "Uporabnik |||| Uporabniki",
      fields: {
        first_name: "Ime",
        last_name: "Priimek",
        email: "E-pošta",
        secondary_email: "Sekundarni e-naslov",
        secondary_emails: "Sekundarni e-naslovi",
        administrator: "Skrbnik",
        disabled: "Onemogočen",
      },
      create: {
        error: "Pri ustvarjanju uporabnika je prišlo do napake.",
        success:
          "Uporabnik ustvarjen. Kmalu bo prejel e-pošto za nastavitev gesla.",
        title: "Ustvari novega uporabnika",
      },
      edit: {
        error: "Prišlo je do napake. Poskusite znova.",
        record_not_found: "Zapis ni najden",
        success: "Uporabnik uspešno posodobljen",
        title: "Uredi %{name}",
      },
      action: {
        new: "Nov uporabnik",
      },
    },
    tasks: {
      name: "Opravilo |||| Opravila",
      forcedCaseName: "Opravilo",
      fields: {
        text: "Opis",
        due_date: "Rok",
        type: "Vrsta",
        contact_id: "Stik",
        due_short: "rok",
      },
      action: {
        add: "Dodaj opravilo",
        create: "Ustvari opravilo",
        edit: "Uredi opravilo",
      },
      actions: {
        postpone_next_week: "Prestavi na naslednji teden",
        postpone_tomorrow: "Prestavi na jutri",
        title: "dejanja opravila",
      },
      added: "Opravilo dodano",
      deleted: "Opravilo uspešno izbrisano",
      dialog: {
        create: "Ustvari opravilo",
        create_for: "Ustvari opravilo za %{name}",
      },
      sheet: {
        edit: "Uredi opravilo",
        edit_for: "Uredi opravilo za %{name}",
      },
      empty: "Še ni opravil",
      empty_list_hint: "Tu se prikažejo opravila, dodana stikom.",
      filters: {
        later: "Kasneje",
        overdue: "Zamujeno",
        this_week: "Ta teden",
        today: "Danes",
        tomorrow: "Jutri",
        with_pending: "Z odprtimi opravili",
      },
      regarding_contact: "(Zadeva: %{name})",
      updated: "Opravilo posodobljeno",
    },
    tags: {
      name: "Oznaka |||| Oznake",
      action: {
        add: "Dodaj oznako",
        create: "Ustvari novo oznako",
      },
      dialog: {
        color: "Barva",
        create_title: "Ustvari novo oznako",
        edit_title: "Uredi oznako",
        name_label: "Ime oznake",
        name_placeholder: "Vnesite ime oznake",
      },
      empty: "Še ni oznak.",
    },
  },
  crm: {
    action: {
      reset_password: "Ponastavi geslo",
    },
    auth: {
      first_name: "Ime",
      last_name: "Priimek",
      confirm_password: "Potrdi geslo",
      confirmation_required:
        "Za potrditev računa sledite povezavi, ki smo vam jo poslali po e-pošti.",
      recovery_email_sent:
        "Če ste registrirani, boste kmalu prejeli e-pošto za obnovitev gesla.",
      sign_in_failed: "Prijava ni uspela.",
      sign_in_google_workspace: "Prijava z Google Workspace",
      signup: {
        create_account: "Ustvari račun",
        create_first_user:
          "Za dokončanje namestitve ustvarite prvi uporabniški račun.",
        creating: "Ustvarjanje…",
        initial_user_created: "Začetni uporabnik uspešno ustvarjen",
      },
      welcome_title: "Dobrodošli v Profiletter",
    },
    chat: {
      title: "Profiletter Chat",
      nav: "Chat",
      placeholder: "Vprašajte o strankah ali leadih…",
      empty_title: "Profiletter Chat",
      empty_subtitle: "Vprašajte o svojih strankah in leadih.",
      disclaimer:
        "Profiletter Chat se lahko zmoti. Preverite pomembne CRM podatke.",
      suggestions: {
        active_stranke: "Pokaži vse aktivne stranke",
        leads_followup: "Kateri leadi potrebujejo nadaljnje korake?",
        recent_activity: "Povzemi nedavno aktivnost strank",
        no_next_step: "Najdi leade brez datuma naslednjega koraka",
      },
      new_chat: "Nov klepet",
      new: "Novo",
      ask_subtitle: "Vprašajte o strankah in leadih",
      send: "Pošlji sporočilo",
      stop: "Ustavi generiranje",
      unavailable: "Asistent trenutno ni na voljo.",
      api_unreachable: "Profiletter Chat API ni dosegljiv.",
      api_offline:
        "Povezava s Profiletter Chat ni uspela. Ali API teče?",
    },
    common: {
      account_manager: "Skrbnik računa",
      activity: "Aktivnost",
      added: "dodano",
      details: "Podrobnosti",
      last_activity_with_date: "zadnja aktivnost %{date}",
      load_more: "Naloži več",
      misc: "Razno",
      past: "Preteklo",
      read_more: "Preberi več",
      retry: "Poskusi znova",
      show_less: "Prikaži manj",
      copied: "Kopirano!",
      copy: "Kopiraj",
      loading: "Nalaganje…",
      me: "Jaz",
      task_count: "%{smart_count} opravilo |||| %{smart_count} opravil",
    },
    changelog: {
      title: "Dnevnik sprememb",
    },
    activity: {
      added_company: "%{name} je dodal/a podjetje",
      you_added_company: "Dodali ste podjetje",
      added_contact: "%{name} je dodal/a",
      you_added_contact: "Dodali ste",
      added_note: "%{name} je dodal/a opombo o",
      you_added_note: "Dodali ste opombo o",
      added_note_about_deal: "%{name} je dodal/a opombo o leadu",
      you_added_note_about_deal: "Dodali ste opombo o leadu",
      added_deal: "%{name} je dodal/a lead",
      you_added_deal: "Dodali ste lead",
      at_company: "pri",
      to: "v",
      load_more: "Naloži več aktivnosti",
    },
    dashboard: {
      deals_chart: "Prihajajoči prihodek iz leadov",
      deals_pipeline: "Pipeline leadov",
      latest_activity: "Zadnja aktivnost",
      latest_activity_error: "Napaka pri nalaganju aktivnosti",
      latest_notes: "Moje zadnje opombe",
      latest_notes_added_ago: "dodano %{timeAgo}",
      stepper: {
        install: "Namesti Profiletter",
        progress: "%{step}/3 končano",
        whats_next: "Kaj sledi?",
      },
      upcoming_tasks: "Prihajajoča opravila",
      welcome_title: "Dobrodošli v Profiletter CRM",
      welcome_body:
        "Upravljajte stranke, leade in klepetajte z AI asistentom — vse na enem mestu.",
      welcome_ecosystem:
        "Digitalni marketing kot povezan ekosistem. Od prvih leadov do zvestih strank.",
      welcome_more: "Več na",
    },
    data_import: {
      button: "Uvozi CSV",
      complete:
        "Uvoz končan. Uvoženih %{importCount} zapisov, %{errorCount} napak",
      csv_file: "CSV datoteka",
      error:
        "Uvoz datoteke ni uspel. Preverite, da gre za veljavno CSV datoteko.",
      in_progress: "Uvoz v teku…",
      progress:
        "Uvoženih %{importCount} / %{rowCount} zapisov, %{errorCount} napak.",
      remaining_time: "Ocenjeni preostali čas:",
      resource: "Vir",
      sample_download: "Prenesi vzorec CSV",
      sample_hint: "Tukaj je vzorčna CSV datoteka, ki jo lahko uporabite kot predlogo",
      start: "Začni uvoz",
      stop: "Ustavi uvoz",
      stopped:
        "Uvoz ustavljen. Uvoženih %{importCount} zapisov, %{errorCount} napak",
      title: "Uvozi podatke",
    },
    header: {
      import_data: "Uvozi iz JSON",
    },
    search: {
      title: "Iskanje",
      placeholder: "Išči stranke, podjetja, leade, opravila in opombe…",
      hint: "Za iskanje vnesite vsaj %{min} znakov",
      empty: "Ni rezultatov",
      error: "Iskanje trenutno ni na voljo. Poskusite znova.",
      untitled_result: "(brez naslova)",
      groups: {
        contacts: "Stranke",
        companies: "Podjetja",
        deals: "Leads",
        tasks: "Opravila",
        contact_notes: "Opombe strank",
        deal_notes: "Opombe leadov",
      },
    },
    image_editor: {
      change: "Spremeni",
      drop_hint: "Spustite datoteko za nalaganje ali kliknite za izbiro.",
      editable_content: "Vsebina za urejanje",
      title: "Naloži in prilagodi sliko",
      update_image: "Posodobi sliko",
    },
    import: {
      action: {
        download_error_report: "Prenesi poročilo o napakah",
        import: "Uvozi",
        import_another: "Uvozi drugo datoteko",
      },
      error: {
        unable: "Te datoteke ni mogoče uvoziti.",
      },
      idle: {
        description_1:
          "Uvozite lahko uporabnike, podjetja, stike, opombe in opravila.",
        description_2:
          "Podatki morajo biti v JSON datoteki po naslednjem vzorcu:",
      },
      status: {
        all_success: "Vsi zapisi so bili uspešno uvoženi.",
        complete: "Uvoz končan.",
        failed: "Neuspešno",
        imported: "Uvoženo",
        in_progress:
          "Uvoz v teku — ne zapuščajte te strani.",
        some_failed: "Nekateri zapisi niso bili uvoženi.",
        table_caption: "Status uvoza",
      },
      title: "Uvozi iz JSON",
    },
    settings: {
      about: "O aplikaciji",
      companies: {
        sectors: "Sektorji",
      },
      dark_mode_logo: "Logotip za temni način",
      deals: {
        categories: "Kategorije",
        currency: "Valuta",
        pipeline_help:
          "Izberite faze leadov, ki štejejo v pipeline.",
        pipeline_statuses: "Statusi pipeline",
        stages: "Faze",
      },
      light_mode_logo: "Logotip za svetli način",
      notes: {
        statuses: "Statusi",
      },
      reset_defaults: "Ponastavi na privzeto",
      save_error: "Shranjevanje nastavitev ni uspelo",
      saved: "Nastavitve uspešno shranjene",
      saving: "Shranjevanje…",
      tasks: {
        types: "Vrste",
      },
      preferences: "Nastavitve",
      title: "Nastavitve",
      app_title: "Naslov aplikacije",
      sections: {
        branding: "Znamka",
      },
      validation: {
        duplicate: "Podvojeno %{display_name}: %{items}",
        in_use:
          "Ni mogoče odstraniti %{display_name}, ki so še v uporabi pri leadih: %{items}",
        validating: "Preverjanje…",
        entities: {
          categories: "kategorije",
          stages: "faze",
        },
      },
    },
    theme: {
      dark: "Temno",
      label: "Tema",
      light: "Svetlo",
      system: "Sistemsko",
    },
    language: "Jezik",
    navigation: {
      label: "CRM navigacija",
    },
    profile: {
      add_secondary_email: "Dodaj e-naslov",
      email_taken: "%{email} že uporablja drug uporabnik",
      no_secondary_emails: "Brez",
      secondary_email_invalid: "%{email} ni veljaven e-naslov",
      secondary_email_is_primary: "%{email} je že vaš glavni naslov",
      secondary_email_taken: "%{email} že uporablja drug uporabnik",
      too_many_secondary_emails:
        "Ne morete dodati več kot 10 sekundarnih e-naslovov",
      secondary_emails_help:
        "Drugi naslovi, s katerih pošiljate e-pošto. Pustite prazno za odstranitev.",
      inbound: {
        description:
          "E-pošto lahko začnete pošiljati na naslov za vhodno pošto, npr. z dodajanjem v polje %{field}. Profiletter bo obdelal sporočila in dodal opombe ustreznim stikom.",
        title: "Vhodna e-pošta",
      },
      mcp: {
        title: "MCP strežnik",
        description:
          "Uporabite ta URL za povezavo AI asistenta s CRM podatki prek Model Context Protocol (MCP).",
      },
      password: {
        change: "Spremeni geslo",
      },
      password_reset_sent:
        "E-pošta za ponastavitev gesla je bila poslana na vaš naslov",
      record_not_found: "Zapis ni najden",
      title: "Profil",
      updated: "Vaš profil je bil posodobljen",
      update_error: "Prišlo je do napake. Poskusite znova",
    },
    validation: {
      invalid_url: "Mora biti veljaven URL",
      invalid_linkedin_url: "URL mora biti z linkedin.com",
    },
  },
};
