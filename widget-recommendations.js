(function(){
  function loadWidget(settings, targetDiv) {
    // Тут ваш renderOffers и всё что было раньше.
    // SETTINGS содержит apikey, templateId, и т.д.
    // Например:
    // settings.apiKey
    // settings.templateId

    // 1. Вставить форму:
    targetDiv.innerHTML = `
      <form id="recForm">
        <label>Email <input type="email" name="email" required></label>
        <label>OrderId <input name="orderId" required></label>
        <label>SKU <input name="sku" required></label>
        <button type="submit">Get recommendations</button>
      </form>
      <div id="output"></div>
    `;

    // 2. Тот же JS что был у вас (renderOffers...)
    // ... (сюда вставить вашу функцию renderOffers(offers))

    // 3. Обновить endpoint, брать apikey из settings
    document.getElementById('recForm').onsubmit = async function(e){
      e.preventDefault();
      const email = this.email.value, orderId = this.orderId.value, sku = this.sku.value;
      const data = { /* ... */ };
      document.getElementById('output').innerHTML = "Loading...";
      try {
        const resp = await fetch(
          `https://services-staging.stacktome.com/api/recommendations/v1/templates/${settings.templateId}/recommendations?apikey=${settings.apiKey}`,
          { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }
        );
        // дальше ваш парсинг и вывод офферов
      } catch(err){
        document.getElementById('output').innerHTML = 'Error: '+err;
      }
    };
  }

  // Найти <script data-...> и div, который перед ним
  window.addEventListener('DOMContentLoaded', function() {
    var script = document.currentScript || (function(){
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length-1];
    })();

    // Можно разрешить data-params='{"widgetId":1, ...}' как JSON
    var settings = {
      widgetId: script.getAttribute('data-widget-id'),
      apiKey: script.getAttribute('data-apikey'),
      templateId: script.getAttribute('data-template-id'),
      staging: script.getAttribute('data-staging') === 'true'
    };
    var div = document.getElementById('stacktome-recs-widget-'+settings.widgetId);
    if(div) loadWidget(settings, div);
  });
})();
