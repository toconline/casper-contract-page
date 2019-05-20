import '@casper2020/casper-button/casper-button.js';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class CasperContract extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          padding: 10px;
          max-width: 960px;
          box-sizing: border-box;
          /* word-break: break-all; */
          --paper-spinner-color: var(--primary-color);
          --paper-spinner-stroke-width: 5px;
          /* background-color: red; */
        }

        :host(.iframe) {
          width: 100%;
        }

        .content {
          overflow: auto;
          padding: 0px;
          background-color: white;
        }


        .title {
          padding: 20px 20px 0 20px;
        }

        .container-text {
          padding: 0 20px 100px 20px;
          /* background-color: yellow; */
          box-sizing: border-box;
        }

        @media screen and (-ms-high-contrast: active), screen and (-ms-high-contrast: none) {
          .container-text {
            padding: 0 20px 60px 20px;
            /* background-color: red; */
            box-sizing: border-box;
          }
        }

        .content .hero img {
          width: 100%;
          display: inline-block;
        }

        .button-container {
          padding: 10px 20px 0px 20px;
          /*position: fixed;
          bottom: 0;*/
          width: 882px;
        }

        .button-container .inner-container, .button-container .shadow-break{
          margin-left: -20px;
          margin-right: -20px;
        }

        .button-container .inner-container {
          background: #f9f9f9;
          padding: 10px 20px 20px 20px
        }

        .button-container .shadow-break{
          background-image: linear-gradient(-180deg, rgba(238,238,238,0.00) 0%, #f9f9f9 100%);
          border-bottom: 1px #f1f0f0 solid;
          height: 30px;
        }

        .button-container .instructions {
          text-align: center;
          display: inherit;
          margin-bottom: 10px;
          color: gray;
        }

        .button-container .instructions.success {
          color: green;
          font-style: italic;
        }

        .button-container .instructions.error {
          display: none;
          color: red;
          font-style: italic;
        }

        /* .button-container paper-button {
          width: 100%;
        } */

        .title {
          font-size: 30px;
          color: var(--primary-color);
          font-family: var(--default-font-family);
        }


        .buttons {
          display: flex;
        }

        .buttons casper-button {
          width: 100%;
        }

        .buttons casper-button:first-child {
          margin-left: 0px;
        }

        .buttons casper-button#declineButton {
          margin-right: 10px;
        }

        #declineButton {
          --self-primary-color: #b3b3b3;
          display: none;
        }

        @media only screen
        and (min-device-width : 320px)
        and (max-device-width : 1024px)
        and (-webkit-min-device-pixel-ratio: 1)  {

          :host {
            width: 100%;
          }


        }
      </style>

      <div class="content">

        <template is="dom-if" if="[[image]]" restamp="true">
          <div class="hero">
            <img src="[[image]]" alt="hero image">
          </div>
        </template>

        <template is="dom-if" if="[[title]]" restamp="true">
          <div class="title">
            [[title]]
          </div>
        </template>
        <div class="container-text" id="container_text" name="document">
          <slot name="document"></slot>
        </div>
        <div class="button-container" id="action_container">
          <div class="shadow-break"></div>
          <div class="inner-container">
            <small id="instructions" class="instructions">
              <slot name="instructions"></slot>
            </small>
            <small id="error_messages" class="instructions error"></small>

            <div class="buttons">
              <casper-button alt="[[decline_text]]" title="[[decline_text]]" id="declineButton" cssClass="decline-button" on-click="_declineAction">
                <slot name="decline-button">NO</slot>
              </casper-button>

              <casper-button alt="[[action_text]]" title="[[action_text]]" id="submitButton" on-click="_customerAgreement">
                <slot name="action-button">Concordo e aceito</slot>
              </casper-button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static get is() { return 'casper-contract-page'; }
  static get properties() {
    return {
      xhrUrl: {
        type: String,
        value: '/jobs'
      },
      tube: String,
      title: Object,
      image: Object,
      acceptanceRequired: {
        type: Boolean,
        value: false
      },
      checkboxRequired: {
        type: Boolean,
        value: false
      },
      yesNoRequired: {
        type: Boolean,
        value: false
      },
      noDelayResponse: {
        type: Boolean,
        value: false
      }
    };
  }

  ready () {
    super.ready();

    if(this.yesNoRequired == true) {
      this._showButton(this.$.declineButton);
      this.decline_text = this.$.declineButton.children[0].assignedNodes()[0].textContent;
    } else {
      this._hideButton(this.$.declineButton);
      this._buttonState(false, this.$.declineButton);
    }

    if(this.acceptanceRequired == true){
      this._showButton(this.$.submitButton);
      this._buttonState(false, this.$.submitButton);
      this.action_text  = this.$.submitButton.children[0].assignedNodes()[0].textContent;
    } else {
      this._hideButton(this.$.submitButton);
      this._buttonState(true, this.$.submitButton);
    }

    if(this.checkboxRequired == false){
      window.onscroll = function(ev) {

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
          // this.$.submitButton.disabled = false;
          this._buttonState(false, this.$.submitButton);
        }
      }.bind(this);
    }

    this._adjustButton();

    window.onresize = function () {
      this._adjustButton();
    }.bind(this);

    this.style.opacity = 1;


    if(this.checkboxRequired == true){
      this.$.container_text.addEventListener('tap', function (event) {
        if(event.target.parentElement.className == 'checkbox'){
          this._buttonState(!event.target.parentElement.children[0].checked);
        }
      }.bind(this), false);
    }
  }

  _errorMessage (msg) {
    this.$.instructions.classList.remove("success");
    this.$.instructions.style.display   = 'none';
    this.$.error_messages.innerText     = msg;
    this.$.error_messages.style.display = 'block';
  }

  _successMessage (msg) {
    this.$.error_messages.style.display   = 'none';
    this.$.instructions.classList.add("success");
    this.$.instructions.style.display     = 'block';
    this.$.instructions.innerText         = msg;
  }

  _adjustButton () {
    var text   = this.shadowRoot.querySelector('.container-text');
    var button = this.shadowRoot.querySelector('.button-container');
    button.style.width = text.getBoundingClientRect().width - 40 + 'px';
  }

  _buttonState (state, button) {
    button.disabled = state;
  }
  _submittingState (state, button, event) {
    button.submitting(state);
  }

  _declineAction (event) {
    this._hideButton(this.$.submitButton);
    this._sendToJob(event, 'decline', this.$.declineButton);
  }

  _customerAgreement (event) {
    this._hideButton(this.$.declineButton);
    this._sendToJob(event, 'accept', this.$.submitButton);
  }

  _hideButton(element) {
    element.style.display = 'none';
  }

  _showButton(element) {
    element.style.display = 'block';
  }

  _submitJobResponse (notification) {
    let button = this.$.submitButton.style.display === 'none' ? this.$.declineButton : this.$.submitButton;

    const delay = this.noDelayResponse ? 0 : 2000;
    let response_message = notification.response.message;

    switch (notification.status_code) {
      case 200:
        this._successMessage(response_message);
        this.app.markContractAsViewd(this.contract);
        button.progress = 100;

        if (notification.response.redirect_to != undefined) {
          setTimeout( ( () => window.location = notification.response.redirect_to ), delay);
        }

        if (notification.response.close_modal != undefined && notification.response.close_modal == true) {
          this._closeMe(delay);
        }
        break;

      case 409:
      case 500:
        this._errorMessage(response_message);
        this._disableSubmit(button, delay);
        break;

      default:
        this._errorMessage('Alguma coisa correu mal, por favor tente novamente.');
        this._disableSubmit(button, delay);
    }
  }

  _disableSubmit (button, delay) {
    this._submittingState(false, button);
    button.progress = 0;

    this._closeMe(delay);
  }

  _closeMe (delay) {
    setTimeout( ( () => this.dialog.close() ).bind(this), delay);
    this.dialog.socket.extendSession();
  }

  _sendToJob (event, action, button) {
    this._submittingState(true, button, event);
    this.dialog.socket.submitJob(Object.assign({}, {
        tube: this.contract.tube,
        dialog_id: this.contract.dialog_id,
        user_email: window.app.session_data.user_email,
        action: action,
        user_id: null,
        entity_id: null,
        entity_schema: null,
        company_schema: null,
        subentity_schema: null,
        subentity_prefix: null,
        origin_ip: null
      }, this.contract.payload || {}),
      this._submitJobResponse.bind(this), {
        ttr: 15,
        validity: 20,
        timeout: 20,
        overlay: {
          message: 'A registar resposta',
          icon: 'switch',
          spinner: true,
        }
      }
    );
  }
}

window.customElements.define(CasperContract.is, CasperContract);
