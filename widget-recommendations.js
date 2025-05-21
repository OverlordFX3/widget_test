(function() {
  function renderOffers(offers, outputDiv) {
    let idx = 0;
    function showOffer(idx) {
      const offer = offers[idx];
      let imagesHtml = offer.productImages.map(src => `<img src="${src||''}" style="max-width:100%;height:160px;object-fit:cover;margin-bottom:8px;border-radius:8px;">`).join('');
      let ratingHTML = (offer.rating ? `<div style="color:#CA0;font-size:13px;margin-bottom:7px;">★ ${offer.rating.toFixed(1)} (${offer.reviewCount||0})</div>` : '');
      outputDiv.innerHTML = `
        <div style="box-shadow:0 2px 8px #0001;border-radius:10px;padding:15px 12px;background:#fff;max-width:350px;margin:24px auto;">
          <div style="margin-bottom:12px;position:relative;">${imagesHtml}</div>
          <div style="font-size:17px;font-weight:bold;margin-bottom:6px;">${offer.productName}</div>
          ${ratingHTML}
          <div style="font-size:14px;color:#333;margin-bottom:8px;">
            ${offer.productDescription ? offer.productDescription.replace(/<\/?[^>]+(>|$)/g, "") : ""}
          </div>
          <div style="font-weight:bold;font-size:18px;color:#2976FF;">${offer.productPriceCurrencySymbol||'A$'}${(+offer.productPrice).toFixed(2)}</div>
          <div style="margin-top:14px;display:flex;gap:10px;justify-content:stretch">
            <button style="flex:1;padding:8px 0;background:#2976FF;color:#fff;border:0;border-radius:5px;font-weight:bold;cursor:pointer;"
                onclick="window.open('${offer.offerUrl}','_blank')">Buy now</button>
            <button style="flex:1;padding:8px 0;background:#fff;color:#2976FF;font-weight:bold;border:1.5px solid #2976FF;border-radius:5px;cursor:pointer;"
                onclick="this.closest('div').querySelector('.nextOfferBtn').click()">Next</button>
            <button class="nextOfferBtn" style="display:none"></button>
          </div>
        </div>
      `;
      outputDiv.querySelector('.nextOfferBtn').onclick = function() {
        idx = (idx+1)%offers.length;
        showOffer(idx);
      };
    }
    showOffer(idx);
  }

  function fetchOffers(settings, outputDiv, data) {
    outputDiv.innerHTML = 'Loading...';
    fetch(
      `https://services-staging.stacktome.com/api/recommendations/v1/templates/${settings.templateId}/recommendations?apikey=${settings.apiKey}`,
      {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(data)
      }
    ).then(async resp => {
      if (!resp.ok) throw new Error('HTTP '+resp.status);
      const json = await resp.json();
      // сервер возвращает офферсы не в widgetConfig, а в html внутри input#offers-data!
      const parser = new DOMParser();
      const doc = parser.parseFromString(json.data || "", "text/html");
      const offersInput = doc.getElementById("offers-data");
      let offers = [];
      if (offersInput && offersInput.value) {
          offers = JSON.parse(offersInput.value);
      }
      if (!offers.length) throw new Error('No offers found');
      outputDiv.innerHTML = "";
      renderOffers(offers, outputDiv);
    }).catch(err => {
      outputDiv.innerHTML = 'Error: '+err.message;
    });
  }

  // Автоинит: ищет свой скрипт, берет data-params, ищет соседний div, вставляет форму
  window.addEventListener('DOMContentLoaded', function() {
    var script = document.currentScript || (function(){
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length-1];
    })();

    var settings = {
      widgetId: script.getAttribute('data-widget-id'),
      apiKey: script.getAttribute('data-apikey'),
      templateId: script.getAttribute('data-template-id'),
      staging: script.getAttribute('data-staging') === 'true'
    };

    var wrapper = document.getElementById('stacktome-recs-widget-'+settings.widgetId);
    if (!wrapper) return;

    wrapper.innerHTML = `
      <form id="recForm" style="max-width:340px;margin:8px auto 20px auto;box-shadow:0 2px 8px #0001;border-radius:6px;padding:16px;background:#f9fafe;">
        <div style="margin-bottom:6px;font-weight:bold;font-size:16px;color:#247;">Stacktome Recommendations DEMO</div>
        <label>Email:<br><input type="email" name="email" required style="width:98%;margin-bottom:8px;padding:6px;"></label>
        <br>
        <label>OrderId:<br><input name="orderId" required style="width:98%;margin-bottom:8px;padding:6px;"></label>
        <br>
        <label>SKU:<br><input name="sku" required style="width:98%;margin-bottom:8px;padding:6px;"></label>
        <br>
        <button type="submit" style="margin-top:7px;width:100%;padding:8px 0;background:#2976FF;color:#fff;border:0;border-radius:5px;font-weight:bold;cursor:pointer;">Get recommendations</button>
      </form>
      <div id="output" style="margin-top:15px;"></div>
    `;

    var form = wrapper.querySelector("#recForm");
    var outputDiv = wrapper.querySelector("#output");
    form.onsubmit = function(e){
      e.preventDefault();
      const email = this.email.value;
      const orderId = this.orderId.value;
      const sku = this.sku.value;
      // можно добавить проверки, но форма и так required
      const data = {
        "products": [ { "sku": sku, "quantity": 1 } ],
        "orderId": orderId,
        "email": email
      };
      fetchOffers(settings, outputDiv, data);
    };
  });
})();
