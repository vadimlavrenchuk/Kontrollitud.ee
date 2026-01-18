import React from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/LegalPages.scss';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Privaatsuspoliitika | Kontrollitud.ee</title>
        <meta name="description" content="Kontrollitud.ee privaatsuspoliitika ja GDPR õigused. Политика конфиденциальности и права пользователей." />
      </Helmet>
      <div className="legal-page">
        <h1>Privaatsuspoliitika</h1>
        
        {/* Estonian Version */}
        <section>
          <p>
            Käesolev privaatsuspoliitika selgitab, kuidas <strong>Vadym Lavrenchuk</strong> (edaspidi "Haldaja") 
            kogub ja töötleb kasutajate andmeid veebilehel <strong>kontrollitud.ee</strong>.
          </p>

          <h2>1. Kogutavad andmed</h2>
          <p>Me kogume järgmisi andmeid:</p>
          <ul>
            <li>E-posti aadress (teenuse kasutamiseks ja teavitusteks).</li>
            <li>Makseinfo (töödeldakse turvaliselt läbi Stripe makselahenduse, Haldaja ei näe ega salvesta kaardiandmeid).</li>
            <li>Veebilehe kasutusstatistika (küpsised).</li>
          </ul>

          <h2>2. Andmete kasutus</h2>
          <p>
            Andmeid kasutatakse teenuse osutamiseks, klienditoe pakkumiseks ja seadusest tulenevate kohustuste 
            täitmiseks (maksuarvestus LHV ettevõtluskonto kaudu).
          </p>

          <h2>3. Kolmandad osapooled</h2>
          <p>Andmeid jagatakse järgmiste partneritega:</p>
          <ul>
            <li>Stripe Payments Europe, Ltd. (maksete töötlemine).</li>
            <li>Zoho Corporation (e-posti teenus).</li>
          </ul>

          <h2>4. Kontakt</h2>
          <p>Küsimuste korral võtke ühendust: <a href="mailto:info@kontrollitud.ee">info@kontrollitud.ee</a></p>
        </section>

        <hr style={{ margin: '60px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />

        {/* English Version */}
        <section>
          <h1 style={{ fontSize: '2rem', marginTop: 0 }}>Privacy Policy</h1>
          
          <p>
            This privacy policy explains how <strong>Vadym Lavrenchuk</strong> (hereinafter "Administrator") 
            collects and processes user data on the website <strong>kontrollitud.ee</strong>.
          </p>

          <h2>1. Data collected</h2>
          <p>We collect the following data:</p>
          <ul>
            <li>Email address (for service use and notifications).</li>
            <li>Payment information (processed securely via Stripe, Administrator does not see or store card data).</li>
            <li>Website usage statistics (cookies).</li>
          </ul>

          <h2>2. Data use</h2>
          <p>
            Data is used to provide services, customer support, and fulfill legal obligations 
            (tax accounting via LHV business account).
          </p>

          <h2>3. Third parties</h2>
          <p>Data is shared with the following partners:</p>
          <ul>
            <li>Stripe Payments Europe, Ltd. (payment processing).</li>
            <li>Zoho Corporation (email service).</li>
          </ul>

          <h2>4. Contact</h2>
          <p>For questions, contact: <a href="mailto:info@kontrollitud.ee">info@kontrollitud.ee</a></p>
        </section>

        <hr style={{ margin: '60px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />

        {/* Russian Version */}
        <section>
          <h1 style={{ fontSize: '2rem', marginTop: 0 }}>Политика конфиденциальности</h1>
          
          <p>
            Настоящая политика конфиденциальности объясняет, как <strong>Вадим Лавренчук</strong> (далее "Администратор") 
            собирает и обрабатывает данные пользователей на сайте <strong>kontrollitud.ee</strong>.
          </p>

          <h2>1. Собираемые данные</h2>
          <p>Мы собираем следующие данные:</p>
          <ul>
            <li>Адрес электронной почты (для использования сервиса и уведомлений).</li>
            <li>Платежная информация (обрабатывается безопасно через Stripe, Администратор не видит и не хранит данные карт).</li>
            <li>Статистика использования сайта (cookies).</li>
          </ul>

          <h2>2. Использование данных</h2>
          <p>
            Данные используются для предоставления услуг, поддержки клиентов и выполнения законодательных обязательств 
            (налоговый учет через предпринимательский счет LHV).
          </p>

          <h2>3. Третьи стороны</h2>
          <p>Данные передаются следующим партнерам:</p>
          <ul>
            <li>Stripe Payments Europe, Ltd. (обработка платежей).</li>
            <li>Zoho Corporation (почтовый сервис).</li>
          </ul>

          <h2>4. Контакт</h2>
          <p>По вопросам обращайтесь: <a href="mailto:info@kontrollitud.ee">info@kontrollitud.ee</a></p>
        </section>
      </div>
    </>
  );
}
