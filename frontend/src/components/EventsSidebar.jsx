// Kontrollitud.ee/frontend/src/components/EventsSidebar.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import './EventsSidebar.scss';

const EventsSidebar = () => {
  const { t } = useTranslation();

  // Структура событий с датами и ключами для переводов
  // TODO: В будущем заменить на API запрос к бэкенду
  const events = [
    {
      id: 1,
      date: new Date(2026, 1, 15), // February 15, 2026 (месяц 0-indexed)
      nameKey: 'event_tallinn_farmers_market',
      city: 'Tallinn'
    },
    {
      id: 2,
      date: new Date(2026, 1, 18), // February 18, 2026
      nameKey: 'event_tartu_local_market',
      city: 'Tartu'
    },
    {
      id: 3,
      date: new Date(2026, 1, 22), // February 22, 2026
      nameKey: 'event_parnu_craft_fair',
      city: 'Pärnu'
    }
  ];

  // Функция для получения короткого названия месяца
  const getMonthKey = (monthIndex) => {
    const monthKeys = [
      'month_jan', 'month_feb', 'month_mar', 'month_apr',
      'month_may', 'month_jun', 'month_jul', 'month_aug',
      'month_sep', 'month_oct', 'month_nov', 'month_dec'
    ];
    return monthKeys[monthIndex];
  };

  // Функция для получения названия дня недели
  const getDayOfWeekKey = (dayIndex) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  // Форматирование события
  const formatEvent = (event) => {
    const day = event.date.getDate();
    const monthKey = getMonthKey(event.date.getMonth());
    const dayOfWeekKey = getDayOfWeekKey(event.date.getDay());

    return {
      ...event,
      formattedDate: `${day} ${t(monthKey)}`,
      dayOfWeek: t(dayOfWeekKey),
      name: t(event.nameKey)
    };
  };

  const formattedEvents = events.map(formatEvent);

  return (
    <aside className="events-sidebar">
      <div className="events-sidebar__header">
        <h3 className="events-sidebar__title">
          {t('events_sidebar_title')}
        </h3>
      </div>

      <div className="events-sidebar__list">
        {formattedEvents.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-card__date">
              <FontAwesomeIcon icon={faCalendar} className="event-card__icon" />
              <div className="event-card__date-info">
                <span className="event-card__day">{event.formattedDate}</span>
                <span className="event-card__weekday">{event.dayOfWeek}</span>
              </div>
            </div>
            
            <div className="event-card__content">
              <h4 className="event-card__name">{event.name}</h4>
              <div className="event-card__location">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="event-card__location-icon" />
                <span>{event.city}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="events-sidebar__footer">
        <p className="events-sidebar__hint">
          {t('events_sidebar_hint')}
        </p>
      </div>
    </aside>
  );
};

export default EventsSidebar;
