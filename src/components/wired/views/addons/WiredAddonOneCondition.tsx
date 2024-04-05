import { FC, useEffect, useState } from 'react';
import { LocalizeText, WiredFurniType } from '../../../../api';
import { Column, Flex, Text } from '../../../../common';
import { useWired } from '../../../../hooks';
import { WiredAddonBaseView } from './WiredAddonBaseView';

export const WiredAddonOneCondition: FC<{}> = props =>
{
    const [ type, setType ] = useState(1);
    const [ string, setString ] = useState("0");
    const { trigger = null, setIntParams = null, setStringParam = null } = useWired();

    const save = () =>  { 
        setIntParams([ type ]); 
        setStringParam(string);
    }

    useEffect(() =>
    {
        setType(trigger.intData.length > 0 ? trigger.intData[0] : 1);
        setString(!isNaN(parseFloat(trigger.stringData)) ? trigger.stringData : "0");
    }, [ trigger ]);
    
    return (
        <WiredAddonBaseView requiresFurni={ WiredFurniType.STUFF_SELECTION_OPTION_BY_ID } hasSpecialInput={ false } save={ save }>
            <Column gap={ 1 }>
                <Text bold >{ LocalizeText('wired.params.type.conditions') }</Text>
                <Flex alignItems="center" gap={ 1 }>
                    <input className="form-check-input" type="radio" id="typeFlag" checked={ type == 0 } onChange={ event => setType(0) } />
                    <Text >{ LocalizeText('wired.params.type.all') }</Text>
                </Flex>
                <Flex alignItems="center" gap={ 1 }>
                    <input className="form-check-input" type="radio" id="typeFlag" checked={ type == 1 } onChange={ event => setType(1) } />
                    <Text >{ LocalizeText('wired.params.type.least.one') }</Text>
                </Flex>
                <Flex alignItems="center" gap={ 1 }>
                    <input className="form-check-input" type="radio" id="typeFlag" checked={ type == 2 } onChange={ event => setType(2) } />
                    <Text >{ LocalizeText('wired.params.type.not.all') }</Text>
                </Flex>
                <Flex alignItems="center" gap={ 1 }>
                    <input className="form-check-input" type="radio" id="typeFlag" checked={ type == 3 } onChange={ event => setType(3) } />
                    <Text >{ LocalizeText('wired.params.type.nothing') }</Text>
                </Flex>
                <Flex alignItems="center" gap={ 1 }>
                    <input className="form-check-input" type="radio" id="typeFlag" checked={ type == 4 } onChange={ event => setType(4) } />
                    <Text >{ LocalizeText('wired.params.type.less') }</Text>
                    <input className='form-control form-control-sm' type='text' value={string} onChange={ event => setString(event.target.value) } style={{ maxWidth: '60px', maxHeight: '5px' }}></input>
                </Flex>
                <Flex alignItems="center" gap={ 1 }>
                    <input className="form-check-input" type="radio" id="typeFlag" checked={ type == 5 } onChange={ event => setType(5) } />
                    <Text >{ LocalizeText('wired.params.type.more') }</Text>
                    <input className='form-control form-control-sm' type='text' value={string} onChange={ event => setString(event.target.value) } style={{ maxWidth: '60px', maxHeight: '5px' }}></input>
                </Flex>
                <Flex alignItems="center" gap={ 1 }>
                    <input className="form-check-input" type="radio" id="typeFlag" checked={ type == 6 } onChange={ event => setType(6) } />
                    <Text >{ LocalizeText('wired.params.type.exactly') }</Text>
                    <input className='form-control form-control-sm' type='text' value={string} onChange={ event => setString(event.target.value) } style={{ maxWidth: '60px', maxHeight: '5px' }}></input>
                </Flex>
            </Column>
        </WiredAddonBaseView>
    );
}
