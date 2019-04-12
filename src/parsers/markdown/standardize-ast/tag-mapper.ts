/** Mappings from Remarkable types to HTML tag names or vice versa. */
interface Mappings {
  [key: string]: string
}

/** TagMapper maps Remarkable types to HTML tags and vice versa. */
export class TagMapper {
  /** Mappings of tags that have opening and closing varieties. */
  static readonly OPEN_CLOSE_MAPPINGS: Mappings = {
    bold: 'b',
    bullet_list: 'ul',
    list_item: 'li',
    ordered_list: 'ol',
    paragraph: 'p'
  }

  /** Mappings of tags that stand alone, i.e. have no opening and closing varieties. */
  static readonly STANDALONE_MAPPINGS: Mappings = {
    image: 'img'
  }

  /** Maps Remarkable types to their corresponding HTML tags */
  typeTagMappings: Mappings

  /** Maps HTML tag names to their corresponding Remarkable types */
  tagTypeMappings: Mappings

  constructor() {
    this.typeTagMappings = this.createTypeTagMappings()
    this.tagTypeMappings = this.createTagTypeMappings()
  }

  /** Returns the HTML tag for the given Remarkable type. */
  tagForType(type: string): string {
    if (this.typeTagMappings.hasOwnProperty(type)) {
      return this.typeTagMappings[type]
    }
    if (type.endsWith('_open')) {
      return type.substring(0, type.length - 5)
    }
    if (type.endsWith('_close')) {
      return '/' + type.substring(0, type.length - 6)
    }
    return type
  }

  typeForTag(tag: string): string {
    if (this.tagTypeMappings.hasOwnProperty(tag)) {
      return this.tagTypeMappings[tag]
    }
    if (tag.startsWith('/')) {
      return tag.substring(1) + '_close'
    } else {
      return tag + '_open'
    }
  }

  /** Calculates the mappings from Remarkable types to HTML tags */
  private createTypeTagMappings(): Mappings {
    const result = {}
    for (const [type, tag] of Object.entries(TagMapper.OPEN_CLOSE_MAPPINGS)) {
      result[type + '_open'] = tag
      result[type + '_close'] = '/' + tag
    }
    for (const [type, tag] of Object.entries(TagMapper.STANDALONE_MAPPINGS)) {
      result[type] = tag
    }
    return result
  }

  /** Calculates the mappings from HTML tags to Remarkable types */
  private createTagTypeMappings(): Mappings {
    const result = {}
    for (const [type, tag] of Object.entries(this.typeTagMappings)) {
      result[tag] = type
    }
    return result
  }
}
