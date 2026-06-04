import {
  Directive,
  ElementRef,
  AfterViewInit,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appFitText]',
  standalone: true,
})
export class FitTextDirective implements AfterViewInit, OnChanges {
  @Input('appFitText') text: string = '';
  @Input() minFontSize: number = 8;
  @Input() maxFontSize: number = 22;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.fit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text']) {
      setTimeout(() => this.fit(), 0);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.fit();
  }

  private fit() {
    const element = this.el.nativeElement;
    const parent = element.parentElement;
    if (!parent) return;

    let fontSize = this.maxFontSize;
    element.style.fontSize = fontSize + 'px';
    element.style.whiteSpace = 'nowrap';
    element.style.display = 'inline-block';

    const maxWidth = parent.offsetWidth * 0.95;

    while (element.offsetWidth > maxWidth && fontSize > this.minFontSize) {
      fontSize--;
      element.style.fontSize = fontSize + 'px';
    }
  }
}
