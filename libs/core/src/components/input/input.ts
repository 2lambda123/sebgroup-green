import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { constrainSlots } from 'utils/helpers'
import { ifDefined } from 'lit/directives/if-defined.js'
import { when } from 'lit/directives/when.js'
import styles from './style/input.styles.css'
import '../icon/icon'
import '../badge/badge'
// import '../button/button'

/**
 * 
 * @summary A custom input element that can be used in forms.
 * @documentation https://seb.io/docs/component/input
 * @status beta
 * @since 1.0.0
 *
 * @dependency gds-icon, gds-badge, gds-input-helper
 * @element gds-input
 *
 * @fires {CustomEvent} gds-input-changed - Fired when the input value changes.
 *
 * @cssprop --gds-input-background-color - The background color of the input.
 * @cssprop --gds-input-border-color - The border color of the input.
 *
 * @slot - The default slot for the input element.
 * @slot lead - The slot for the input lead icon.
 * @slot trail - The slot for the input trail icon.
 * @slot badge - The slot for the input badge.
 * @slot helper - The slot for the input helper text.
 *
 * @csspart gds-input - The input element.
 * @csspart gds-input-core - The core of the input element.
 * @csspart gds-input-core-base - The base of the input element.
 * @csspart gds-input-core-lead - The lead of the input element.
 * @csspart gds-input-core-trail - The trail of the input element.
 * @csspart gds-input-badge - The badge of the input element.
 * @csspart gds-input-helper - The helper text of the input element.
 *
 * @status beta
 */

@customElement('gds-input')
export class GdsInput extends LitElement {
  static styles = unsafeCSS(styles)

  static shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: true,
  }

  @property({ type: String, reflect: true })
  lead = null

  @property({ type: String, reflect: true })
  trail = null

  @property({ type: String, reflect: true, attribute: "label" })
  label = "Label"
  
  slotLabel() {
    return this.textContent
      ? html`<slot part="label" gds-allow="#text"></slot>`
      : ''
  }

  slotLead() {
      return html`
        <div class="gds-input-core-lead">
          <slot name="lead" gds-allow="gds-icon"></slot>
        </div>
      `;
  }

  updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('trail')) {
      this.updateParentClass();
    }
  }

  updateParentClass() {
    const trailSlotElement = this.renderRoot.querySelector('slot[name="trail"]') as HTMLSlotElement;
    const assignedElements = trailSlotElement.assignedElements({ flatten: true }) as HTMLElement[];
    const parentElement = this.renderRoot.querySelector('.gds-input-core-trail') as HTMLElement;

    if (assignedElements.some(element => element.tagName === 'GDS-BUTTON')) {
      parentElement?.classList.add('gds-input-core-trail-button');
    } else {
      parentElement?.classList.remove('gds-input-core-trail-button');
    }
  }

  slotTrail() {
    return html`
      <div class="gds-input-core-trail">
        <slot name="trail" gds-allow="gds-icon gds-button" @slotchange="${this.updateParentClass}"></slot>
      </div>
    `;
  }

  slotBase() {
    return html`  
      <div class="gds-input-core-base">
        <label for="input">${this.label}</label>
        <input id="input" placeholder=" " />
      </div>
      `
  }

  slotBadge() {
    return html`
      <div class="gds-input-badge">
        <slot name="badge" gds-allow="gds-badge"></slot>
      </div>
    `;
  }
  
  private inputElement: HTMLInputElement | null = null;
  private exludeAttr = ['placeholder', 'id', 'label'];

  private reflectAttributesToInput() {
    if (this.inputElement) {
      const attributes = this.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        if (!this.exludeAttr.includes(attribute.name)) {
          this.inputElement.setAttribute(attribute.name, attribute.value);
        }
      }
    }
  }

  update(changedProperties: Map<PropertyKey, unknown>) {
    super.update(changedProperties);
    if (!this.inputElement) {
      this.inputElement = this.shadowRoot?.getElementById('input') as HTMLInputElement;
    }
    this.reflectAttributesToInput();
  }

  render() { 
    const hasLeadSlot = this.querySelector('[slot="lead"]') !== null;
    const hasTrailSlot = this.querySelector('[slot="trail"]') !== null;
    const hasBadgeSlot = this.querySelector('[slot="badge"]') !== null;
    const content = html`${when( hasLeadSlot, () => this.slotLead())}${this.slotBase()}${when( hasBadgeSlot, () => this.slotBadge())}${when( hasTrailSlot, () => this.slotTrail())}`

    return html`
      <div class="gds-input">
        <div class="gds-input-core">
          ${content}
        </div>
        <slot name="helper" gds-allow="gds-input-helper"></slot>
      </div>
  ` }
}
