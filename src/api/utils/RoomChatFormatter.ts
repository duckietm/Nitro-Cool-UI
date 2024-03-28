import { GetConfiguration } from '../../api';
export const allowedColours: Map<string, string> = new Map();

allowedColours.set('r', 'red');
allowedColours.set('b', 'blue');
allowedColours.set('g', 'green');
allowedColours.set('y', 'yellow');
allowedColours.set('w', 'white');
allowedColours.set('o', 'orange');
allowedColours.set('c', 'cyan');
allowedColours.set('br', 'brown');
allowedColours.set('pr', 'purple');
allowedColours.set('pk', 'pink');

allowedColours.set('black', 'black');
allowedColours.set('red', 'red');
allowedColours.set('orangered', 'orangered');
allowedColours.set('orange', 'orange');
allowedColours.set('yellow', 'yellow');
allowedColours.set('yellowgreen', 'yellowgreen');
allowedColours.set('green', 'green');
allowedColours.set('seagreen', 'seagreen');
allowedColours.set('teal', 'teal');
allowedColours.set('blue', 'blue');
allowedColours.set('darkblue', 'darkblue');
allowedColours.set('indigo', 'indigo');
allowedColours.set('purple', 'purple');
allowedColours.set('violet', 'violet');
allowedColours.set('brown', 'brown');
allowedColours.set('burlywood', 'burlywood');
allowedColours.set('rosybrown', 'rosybrown');
allowedColours.set('saddlebrown', 'saddlebrown');
allowedColours.set('maroon', 'maroon');
allowedColours.set('firebrick', 'firebrick');
allowedColours.set('darkred', 'darkred');
allowedColours.set('chocolate', 'chocolate');
allowedColours.set('sienna', 'sienna');
allowedColours.set('peru', 'peru');
allowedColours.set('darkorange', 'darkorange');
allowedColours.set('orange', 'orange');
allowedColours.set('orangered', 'orangered');
allowedColours.set('tomato', 'tomato');
allowedColours.set('coral', 'coral');
allowedColours.set('darkolivegreen', 'darkolivegreen');
allowedColours.set('olive', 'olive');
allowedColours.set('olivedrab', 'olivedrab');
allowedColours.set('greenyellow', 'greenyellow');
allowedColours.set('yellowgreen', 'yellowgreen');
allowedColours.set('darkgreen', 'darkgreen');
allowedColours.set('limegreen', 'limegreen');
allowedColours.set('lime', 'lime');
allowedColours.set('lawngreen', 'lawngreen');
allowedColours.set('palegreen', 'palegreen');
allowedColours.set('springgreen', 'springgreen');
allowedColours.set('mediumseagreen', 'mediumseagreen');
allowedColours.set('mediumaquamarine', 'mediumaquamarine');
allowedColours.set('aquamarine', 'aquamarine');
allowedColours.set('turquoise', 'turquoise');
allowedColours.set('mediumturquoise', 'mediumturquoise');
allowedColours.set('darkturquoise', 'darkturquoise');
allowedColours.set('aqua', 'aqua');
allowedColours.set('cyan', 'cyan');
allowedColours.set('lightcyan', 'lightcyan');
allowedColours.set('paleturquoise', 'paleturquoise');
allowedColours.set('azure', 'azure');
allowedColours.set('lightblue', 'lightblue');
allowedColours.set('powderblue', 'powderblue');
allowedColours.set('deepskyblue', 'deepskyblue');
allowedColours.set('skyblue', 'skyblue');
allowedColours.set('lightskyblue', 'lightskyblue');
allowedColours.set('steelblue', 'steelblue');
allowedColours.set('royalblue', 'royalblue');
allowedColours.set('mediumslateblue', 'mediumslateblue');
allowedColours.set('slateblue', 'slateblue');
allowedColours.set('darkslateblue', 'darkslateblue');
allowedColours.set('mediumpurple', 'mediumpurple');
allowedColours.set('blueviolet', 'blueviolet');
allowedColours.set('darkviolet', 'darkviolet');
allowedColours.set('darkmagenta', 'darkmagenta');
allowedColours.set('mediumvioletred', 'mediumvioletred');
allowedColours.set('violetred', 'violetred');
allowedColours.set('orchid', 'orchid');
allowedColours.set('darkorchid', 'darkorchid');
allowedColours.set('mediumorchid', 'mediumorchid');
allowedColours.set('thistle', 'thistle');
allowedColours.set('plum', 'plum');
allowedColours.set('purple', 'purple');
allowedColours.set('darkgrey', 'darkgrey');
allowedColours.set('dimgray', 'dimgray');
allowedColours.set('lightgrey', 'lightgrey');
allowedColours.set('grey', 'grey');
allowedColours.set('slategrey', 'slategrey');
allowedColours.set('lightslategrey', 'lightslategrey');
allowedColours.set('whitesmoke', 'whitesmoke');
allowedColours.set('white', 'white');
allowedColours.set('snow', 'snow');
allowedColours.set('mistyrose', 'mistyrose');
allowedColours.set('seashell', 'seashell');
allowedColours.set('antiquewhite', 'antiquewhite');
allowedColours.set('linen', 'linen');
allowedColours.set('oldlace', 'oldlace');
allowedColours.set('papayawhip', 'papayawhip');
allowedColours.set('blanchedalmond', 'blanchedalmond');
allowedColours.set('moccasin', 'moccasin');
allowedColours.set('wheat', 'wheat');
allowedColours.set('navajowhite', 'navajowhite');
allowedColours.set('burlywood', 'burlywood');
allowedColours.set('tan', 'tan');
allowedColours.set('rosybrown', 'rosybrown');
allowedColours.set('sandybrown', 'sandybrown');
allowedColours.set('goldenrod', 'goldenrod');
allowedColours.set('darkgoldenrod', 'darkgoldenrod');
allowedColours.set('peru', 'peru');
allowedColours.set('chocolate', 'chocolate');
allowedColours.set('saddlebrown', 'saddlebrown');
allowedColours.set('sienna', 'sienna');
allowedColours.set('brown', 'brown');

const encodeHTML = (str: string) =>
{
    return str.replace(/([\u00A0-\u9999<>&])(.|$)/g, (full, char, next) =>
    {
        if(char !== '&' || next !== '#')
        {
            if(/[\u00A0-\u9999<>&]/.test(next)) next = '&#' + next.charCodeAt(0) + ';';

            return '&#' + char.charCodeAt(0) + ';' + next;
        }

        return full;
    });
}

export const RoomChatFormatter = (content: string) => {
    let result = '';

    content = encodeHTML(content);
    content = content.replace(/\[tag\](.*?)\[\/tag\]/g, '<span class="chat-tag"><b>$1</b></span>');

    // Youtube link
    if (!GetConfiguration<boolean>('youtube.publish.disabled', false)) {
        content = content.replace(
            /(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?.*v=|shorts\/)?([a-zA-Z0-9_-]{11})/g,
            `
            <div>
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEQElEQVR4nO2X7WscRRzHt+AbfeEfICK+VVTwjWhVUnI7l8SkDY3Wu5ltfbiZXBNbq8ldiZEkVbHSIAEjCtUWNLXFaNWQElOUomKwD0bxoVLtk3I+oPhUjbvZ5x2Zmb29DUlaa3fTO9gvDOzMbx5+n535zYMkJUqUKFFNKoVIK0CEyogcKZfJCO/2y3qkaldLPn+ZDLEGELYbFeVyVgYgLnGADL5GqgUBRCaYwwC1NzUq5EruPCQnpVpRGpG87/RgGhJFLB88xGzyuvxVAOGtAOIXmU2SpGWsHKzNXcfaySh/Pe9DyeVSkNxzUQDkbO4KgIjH4kBGZLuAaa/j5ZD8LmZHJBniAd4Gtj8kynCXyBNVRuRX6WIJIDLN4gBA/CNzuq5uyyWhmRllQL69VJUAMsQDlT+NR3ynHhXLKVfkkJCcAZDoVQmQyuZuLAOkYPudNQcgSdIysZ0SWq/cf20tAkgyJDMJQHXNAN7ox8WTN6/pulRG2AAI/xZeQjLEj7ATG0BsVd0Sqs/iG2REHO64f70ACL/BbKEtVpUh+VvUqzIAJqDgewEip5lNRmQfO9xYeUNm/dUAkZ8AwidkmL+tKoI40VLJeGZbv97dWdIIVLVcRtOUVlPNrrR4urvZVlvrvSClb6Fq6iaR2HfYxur67TSl1eR9Eaiyvo1nB/ticV7vL04HDsWc9P5i8EiKRObw4GNL5bzqJzbbkQHo3R0/sE7dE99Qb2ZmXnK++HRRR6zxvbyO9fru85uFro7vIwPQcFZlnXq//EwXkvvtqUUdsQ/s53Xst8fOC0DLZdToANa1Gfyv9DxIjSd6qVv6Tjh+/Gue14sPRA+wdrURGYCaXWmHO3e+/Iw75Rz8UEx3X4Far45Qvb9AtUwz/7Z27ZwLMPUeNV9+gVqju6i2GlTW+uDj1Jl6n9ofHOD9BONkW+zoANrS7tkA7Mlx4eT+fVTvWi/WlefOAQjL+Ui0M3c8P8+mFzeIcdrSbnQALSu8CwVwjx0N6nnqP9zm/fmHaPfOBHVPnwz64OO0rPCiA2hYTi8UgMWA3vuwb/Ooesftlb9e6KTWm6Oiz+lDYpyG5TQ6gPCpGhVAc10A4GkapabpAxyOASCCJXQ2gLCcQ1MxLKEIgngOAKVzAPTuDrZtUn3zRjpLYAxBfI5t9H8BhGOguIFab/kx8PHB6LfR8kF2LgD31HG+2ywE4Bz9nFp7XhI22xK70F9neJYFsHvsK2GaHI/+ICtfJRYDsF7ZWVnEtr0gQFjMWd5u7555Nr1nU/RXifJlrpzM54aoPTFGjaGnxGB3NVL73Ul+cZvdRLjNGntNnLTbtvC8uX2Y/2m258/et8bfaW6l1sgODuR8coQaW/viuczV/HWaiT0ylsp5fWDzYSkOseeeXgg9KeEqq/KkbHL++5OyyQmelHCVFTwpC50lY/jp3licT5QoUSIpDv0L7jL5ksuHFDUAAAAASUVORK5CYII="
                    alt="YouTube Icon" style="vertical-align: middle; margin-right: 5px;"><strong>Click on open video to see the YouTube video</strong>
                </div><center><a href="https://youtu.be/$1" target="_blank" style="background-color: red; color: white; padding: 5px 10px; border-radius: 5px; text-decoration: none;">Open Video</a></center>
            `
        );
    }

    const match = content.match(/@[a-zA-Z]+@/);
    if (match) {
        const colorTag = match[0].toString();
        const colorName = colorTag.substr(1, colorTag.length - 2);
        const text = content.replace(colorTag, '');

        if (!allowedColours.has(colorName)) {
            result = text;
        } else {
            const color = allowedColours.get(colorName);
            result = `<span style="color: ${color}">${text}</span>`;
        }
    } else {
        result = content;
    }

    return result;
}
