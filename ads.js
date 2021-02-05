var google;

function Ads(adContainer, videoElement, cb) {
    this.adContainer = adContainer;
    this.videoElement = videoElement;

    this.adContainer.style.display = 'none'

    if (!google) return cb && cb()

    this.adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);
    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

    this.adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        onAdsManagerLoaded.bind(this),
        false)

    this.adsRequest = new google.ima.AdsRequest();
    this.adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
        'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
        'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
        'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    this.adsRequest.linearAdSlotWidth = adContainer.clientWidth;
    this.adsRequest.linearAdSlotHeight = adContainer.clientHeight;
    this.adsRequest.nonLinearAdSlotWidth = adContainer.clientWidth;
    this.adsRequest.nonLinearAdSlotHeight = adContainer.clientHeight / 3;

    // Pass the request to the adsLoader to request ads
    this.adsLoader.requestAds(this.adsRequest);

    function onAdsManagerLoaded(adsManagerLoadedEvent) {
        let ctx = this

        // Instantiate the AdsManager from the adsLoader response and pass it the video element
        this.adsManager = adsManagerLoadedEvent.getAdsManager(
            this.videoElement);

        this.adsManager.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            onAdEvent);

        // Initialize the container. Must be done via a user action on mobile devices.
        this.videoElement.load();
        this.adDisplayContainer.initialize();

        this.adsManager.init(1280, 720, google.ima.ViewMode.NORMAL);

        this.adContainer.style.display = 'block'

        try {
            this.adsManager.init(1280, 720, google.ima.ViewMode.NORMAL);
            this.adsManager.start();
        } catch (adError) {
            // Play the video without ads, if an error occurs
            console.log("AdsManager could not be started");
        }

        function onAdEvent(params) {
            ctx.adContainer.style.display = 'none'

            ctx.adsManager.removeEventListener(
                google.ima.AdEvent.Type.COMPLETE,
                onAdEvent);

            ctx.adsLoader.requestAds(ctx.adsRequest);

            ctx.adContainer.removeChild(ctx.adContainer.childNodes[ctx.adContainer.childNodes.length - 4]);

            ctx.adsManager.destroy();

            cb && cb()
        }

        ctx.adsManager.addEventListener(
            google.ima.AdEvent.Type.COMPLETE,
            onAdEvent);
    }

    this.adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError,
        false);

    function onAdError(adErrorEvent) {
        // Handle the error logging.
        console.log(adErrorEvent.getError());
        if (this.adsManager) {
            this.adsManager.destroy();
        }
    }
}