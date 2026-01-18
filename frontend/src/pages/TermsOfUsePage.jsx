import React from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/LegalPages.scss';

export default function TermsOfUsePage() {
  return (
    <>
      <Helmet>
        <title>Kasutustingimused | Kontrollitud.ee</title>
        <meta name="description" content="Kontrollitud.ee kasutustingimused ja reeglid. Условия использования сервиса Kontrollitud.ee." />
      </Helmet>
      <div className="legal-page">
        <h1>Kasutustingimused</h1>
        
        {/* Estonian Version */}
        <section>
          <p>
            Tere tulemast <strong>kontrollitud.ee</strong> veebilehele. Teenuse kasutamisega nõustute järgmiste tingimustega:
          </p>

          <h2>1. Teenuse olemus</h2>
          <p>
            <strong>kontrollitud.ee</strong> pakub kontrollitud ettevõtete kataloogi teenust koos kliendihinnangutega. 
            Teenust osutab <strong>Vadym Lavrenchuk</strong> eraisikuna, kasutades LHV ettevõtluskontot.
          </p>

          <h2>2. Maksed ja tagastused</h2>
          <ul>
            <li>Kõik maksed teostatakse läbi Stripe platvormi.</li>
            <li>Teenuse eest tasumine toimub vastavalt valitud paketile.</li>
            <li>Tagastused toimuvad vastavalt kehtivale Eesti seadusandlusele.</li>
          </ul>

          <h2>3. Vastutus</h2>
          <p>Haldaja ei vastuta kaudsete kahjude eest, mis võivad tekkida teenuse kasutuskatkestustest.</p>

          <h2>4. Kohaldatav õigus</h2>
          <p>Kõik vaidlused lahendatakse vastavalt Eesti Vabariigi seadustele.</p>

          <h2>5. Kontakt</h2>
          <p>Küsimuste korral: <a href="mailto:info@kontrollitud.ee">info@kontrollitud.ee</a></p>
        </section>

        <hr style={{ margin: '60px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />

        {/* English Version */}
        <section>
          <h1 style={{ fontSize: '2rem', marginTop: 0 }}>Terms of Use</h1>
          
          <p>
            Welcome to the <strong>kontrollitud.ee</strong> website. By using the service, you agree to the following terms:
          </p>

          <h2>1. Service nature</h2>
          <p>
            <strong>kontrollitud.ee</strong> provides a verified companies directory service with customer reviews. 
            The service is provided by <strong>Vadym Lavrenchuk</strong> as a private individual, using an LHV business account.
          </p>

          <h2>2. Payments and refunds</h2>
          <ul>
            <li>All payments are made through the Stripe platform.</li>
            <li>Payment for the service is made according to the selected package.</li>
            <li>Refunds are made in accordance with current Estonian legislation.</li>
          </ul>

          <h2>3. Liability</h2>
          <p>The Administrator is not liable for indirect damages that may arise from service interruptions.</p>

          <h2>4. Applicable law</h2>
          <p>All disputes are resolved in accordance with the laws of the Republic of Estonia.</p>

          <h2>5. Contact</h2>
          <p>For questions: <a href="mailto:info@kontrollitud.ee">info@kontrollitud.ee</a></p>
        </section>

        <hr style={{ margin: '60px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />

        {/* Russian Version */}
        <section>
          <h1 style={{ fontSize: '2rem', marginTop: 0 }}>Условия использования</h1>
          
          <p>
            Добро пожаловать на сайт <strong>kontrollitud.ee</strong>. Используя сервис, вы соглашаетесь со следующими условиями:
          </p>

          <h2>1. Суть сервиса</h2>
          <p>
            <strong>kontrollitud.ee</strong> предоставляет услуги каталога проверенных компаний с отзывами клиентов. 
            Услуги предоставляет <strong>Вадим Лавренчук</strong> как частное лицо, используя предпринимательский счет LHV.
          </p>

          <h2>2. Платежи и возвраты</h2>
          <ul>
            <li>Все платежи осуществляются через платформу Stripe.</li>
            <li>Оплата услуг производится в соответствии с выбранным тарифом.</li>
            <li>Возвраты осуществляются в соответствии с действующим законодательством Эстонии.</li>
          </ul>

          <h2>3. Ответственность</h2>
          <p>Администратор не несет ответственности за косвенный ущерб, который может возникнуть из-за перерывов в работе сервиса.</p>

          <h2>4. Применимое право</h2>
          <p>Все споры разрешаются в соответствии с законодательством Эстонской Республики.</p>

          <h2>5. Контакт</h2>
          <p>По вопросам: <a href="mailto:info@kontrollitud.ee">info@kontrollitud.ee</a></p>
        </section>
      </div>
    </>
  );
}
