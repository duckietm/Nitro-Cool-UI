import * as joypixels from 'emoji-toolkit';

const allowedColours: Map<string, string> = new Map();

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

allowedColours.set('red', 'red');
allowedColours.set('blue', 'blue');
allowedColours.set('green', 'green');
allowedColours.set('yellow', 'yellow');
allowedColours.set('white', 'white');
allowedColours.set('orange', 'orange');
allowedColours.set('cyan', 'cyan');
allowedColours.set('brown', 'brown');
allowedColours.set('purple', 'purple');
allowedColours.set('pink', 'pink');

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

export const RoomChatFormatter = (content: string) =>
{
    let result = '';
    if (content.toLowerCase().includes("onerror="))
    content = "Error al ejecutar";

if (content.toLowerCase().includes("onmouseover="))
    content = "Error al ejecutar";

    content = encodeHTML(content);
    content = (joypixels.shortnameToUnicode(content) as string)

    if(content.includes("giphy.com/media")){
        content = "<p style='background-image: url(" + content + ".gif);width: 70px;height: 70px;margin: 4px 10px 2px 10px;    background-size: cover;border-radius: 2px;'></p>";
     }
    
     if(content.includes("https://int.habbeh.net/audios/"))
     {
        if(content.includes("https://int.habbeh.net/audios/errorpeso"))
        {
            content = "El audio es demasiado pesado";
        }
        else
        {
            content = "<audio style='height: 14px; position: relative; top: 2px;  width: 195px;' controls src='" + content + "'/>";
        }
    }

    if(content.includes("/c_images/emojis/")){
        content = "<span style='background-image: url(" + content + ");margin: 4px 3px 2px 3px;background-size: contain;border-radius: 2px;box-sizing: unset;width: 25px;height: 25px;image-rendering: pixelated;display: inline-block;bottom: 9px;margin-bottom: -15px;position: relative'></span>";
     }
    
    if(content.startsWith('@') && content.indexOf('@', 1) > -1)
    {
        let match = null;

        while((match = /@[a-zA-Z]+@/g.exec(content)) !== null)
        {
            const colorTag = match[0].toString();
            const colorName = colorTag.substr(1, colorTag.length - 2);
            const text = content.replace(colorTag, '');

            if(!allowedColours.has(colorName))
            {
                result = text;
            }
            else
            {
                const color = allowedColours.get(colorName);
                result = '<span style="color: ' + color + '">' + text + '</span>';
            }
            break;
        }
    }
    else
    {
        result = content;
    }

    return result;
}
